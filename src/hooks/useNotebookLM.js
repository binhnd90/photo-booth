import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useNotebookLM
 * ─────────────
 * Connects the app to Google NotebookLM through a user-hosted MCP (Model
 * Context Protocol) bridge. The browser cannot talk to NotebookLM directly
 * (there is no public API), so we speak JSON-RPC 2.0 to an MCP server the
 * user points us at. The bridge is expected to expose these tools:
 *
 *   • list_notebooks  → { notebooks: [{ id, title, emoji?, updatedAt? }] }
 *   • send_chat       ({ notebookId, message }) → { reply, citations? }
 *   • upload_source   ({ notebookId, filename, mimeType, data (base64) })
 *                     → { sourceId, title }
 *
 * Google authentication is handled with Google Identity Services (GIS) so the
 * user logs in with their own Google account; the resulting access token is
 * forwarded to the MCP bridge as a Bearer token.
 */

const SETTINGS_KEY = 'vt-nblm-settings';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
].join(' ');

// ── Settings storage ────────────────────────────────────────────────────────
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch { return {}; }
}
function persist(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

// ── GIS loader ──────────────────────────────────────────────────────────────
let gisPromise = null;
function loadGIS() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GIS_SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
  return gisPromise;
}

// ── MCP JSON-RPC ────────────────────────────────────────────────────────────
let rpcId = 0;
async function mcpRpc(serverUrl, method, params, bearer) {
  if (!serverUrl) throw new Error('MCP server URL is not configured');
  const headers = { 'Content-Type': 'application/json' };
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  const resp = await fetch(serverUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
  });
  let data;
  try { data = await resp.json(); } catch { throw new Error(`MCP HTTP ${resp.status}`); }
  if (data.error) throw new Error(data.error.message || 'MCP error');
  return data.result;
}

async function callTool(serverUrl, bearer, name, args) {
  const result = await mcpRpc(serverUrl, 'tools/call', { name, arguments: args || {} }, bearer);
  // MCP tool results are wrapped in { content: [{ type, text }] } — we try to
  // recover a JSON payload, but pass the raw result through if the bridge
  // returns an already-decoded object.
  if (result && Array.isArray(result.content)) {
    const textPart = result.content.find((c) => c.type === 'text');
    if (textPart?.text) {
      try { return JSON.parse(textPart.text); }
      catch { return { text: textPart.text }; }
    }
  }
  return result;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result || '';
      const comma = s.indexOf(',');
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useNotebookLM() {
  const [settings, setSettingsState] = useState(() => {
    const s = loadSettings();
    return {
      googleClientId: s.googleClientId || '',
      mcpServerUrl: s.mcpServerUrl || '',
    };
  });

  const [user, setUser] = useState(null);          // { name, email, picture }
  const [token, setToken] = useState(null);        // Google OAuth access token
  const [tokenExpiresAt, setTokenExpiresAt] = useState(0);

  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);

  const [messages, setMessages] = useState([]);    // [{ role, content, citations? }]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const tokenClientRef = useRef(null);

  // Persist settings helper
  const updateSettings = useCallback((patch) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const setGoogleClientId = useCallback((id) => updateSettings({ googleClientId: id.trim() }), [updateSettings]);
  const setMcpServerUrl  = useCallback((url) => updateSettings({ mcpServerUrl: url.trim() }), [updateSettings]);

  // ── Google sign-in ──
  const signIn = useCallback(async () => {
    setError(null);
    if (!settings.googleClientId) {
      setError('Missing Google OAuth Client ID');
      return;
    }
    try {
      await loadGIS();
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: settings.googleClientId,
        scope: GOOGLE_SCOPES,
        callback: async (resp) => {
          if (resp.error) { setError(resp.error_description || resp.error); return; }
          const accessToken = resp.access_token;
          const expiresIn = Number(resp.expires_in || 3600);
          try {
            const profile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            }).then((r) => r.json());
            setUser({ name: profile.name, email: profile.email, picture: profile.picture });
            setToken(accessToken);
            setTokenExpiresAt(Date.now() + expiresIn * 1000);
          } catch (err) {
            setError(err.message || 'Failed to fetch Google profile');
          }
        },
      });
      tokenClientRef.current = client;
      client.requestAccessToken({ prompt: '' });
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  }, [settings.googleClientId]);

  const signOut = useCallback(() => {
    try { if (token && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(token, () => {}); } catch { /* ignore */ }
    setUser(null);
    setToken(null);
    setTokenExpiresAt(0);
    setNotebooks([]);
    setSelectedNotebook(null);
    setMessages([]);
  }, [token]);

  // ── Notebook list ──
  const loadNotebooks = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await callTool(settings.mcpServerUrl, token, 'list_notebooks', {});
      const list = Array.isArray(result?.notebooks) ? result.notebooks : Array.isArray(result) ? result : [];
      setNotebooks(list);
    } catch (err) {
      setError(err.message || 'Failed to load notebooks');
    } finally {
      setIsLoading(false);
    }
  }, [settings.mcpServerUrl, token]);

  const selectNotebook = useCallback((nb) => {
    setSelectedNotebook(nb);
    if (!nb) { setMessages([]); return; }
    setMessages([
      {
        role: 'assistant',
        content: `Connected to "${nb.title || nb.name || 'Notebook'}". Ask me anything about the sources in this notebook.`,
      },
    ]);
  }, []);

  // ── Chat ──
  const sendMessage = useCallback(async (text) => {
    const t = (text || '').trim();
    if (!t || isLoading || !selectedNotebook) return;
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: t }]);
    setIsLoading(true);
    try {
      const result = await callTool(settings.mcpServerUrl, token, 'send_chat', {
        notebookId: selectedNotebook.id,
        message: t,
      });
      const reply = result?.reply ?? result?.text ?? '(no reply)';
      const citations = result?.citations || null;
      setMessages((m) => [...m, { role: 'assistant', content: reply, citations }]);
    } catch (err) {
      setError(err.message || 'Failed to reach NotebookLM');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedNotebook, settings.mcpServerUrl, token]);

  // ── Audio upload ──
  const uploadAudio = useCallback(async (blob, filename) => {
    if (!selectedNotebook) throw new Error('No notebook selected');
    setError(null);
    setIsLoading(true);
    try {
      const data = await blobToBase64(blob);
      const result = await callTool(settings.mcpServerUrl, token, 'upload_source', {
        notebookId: selectedNotebook.id,
        filename: filename || `recording-${Date.now()}.webm`,
        mimeType: blob.type || 'audio/webm',
        data,
      });
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `🎙️ Uploaded "${result?.title || filename}" as a new source to this notebook.` },
      ]);
      return result;
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedNotebook, settings.mcpServerUrl, token]);

  // ── Token expiry watcher ──
  useEffect(() => {
    if (!tokenExpiresAt) return;
    const ms = tokenExpiresAt - Date.now();
    if (ms <= 0) { signOut(); return; }
    const id = setTimeout(() => signOut(), ms);
    return () => clearTimeout(id);
  }, [tokenExpiresAt, signOut]);

  return {
    // settings
    settings, setGoogleClientId, setMcpServerUrl,
    // auth
    user, isSignedIn: !!user && !!token, signIn, signOut,
    // notebook data
    notebooks, selectedNotebook, selectNotebook, loadNotebooks,
    // chat & upload
    messages, sendMessage, uploadAudio,
    // status
    isLoading, error,
    // helpers
    resetChat: () => setMessages([]),
  };
}
