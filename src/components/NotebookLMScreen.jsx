import { useEffect, useRef, useState } from 'react';
import { useNotebookLM } from '../hooks/useNotebookLM';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

// ── Phase 1: MCP + Google Client ID setup ────────────────────────────────
function SetupPhase({ settings, onSaveClientId, onSaveServerUrl, onContinue }) {
  const [clientId, setClientId] = useState(settings.googleClientId);
  const [serverUrl, setServerUrl] = useState(settings.mcpServerUrl);

  const ready = clientId.trim().length > 10 && /^https?:\/\//.test(serverUrl.trim());

  const handleContinue = () => {
    onSaveClientId(clientId);
    onSaveServerUrl(serverUrl);
    onContinue();
  };

  return (
    <div className="nblm-setup">
      <div className="nblm-setup-icon">📓</div>
      <h2 className="nblm-setup-title">Connect NotebookLM</h2>
      <p className="nblm-setup-desc">
        Link your Google account and a NotebookLM <strong>MCP bridge server</strong> to talk to
        your notebooks by voice.
      </p>

      <div className="nblm-field">
        <label className="nblm-label">Google OAuth Client ID</label>
        <input
          className="config-input"
          placeholder="xxxxxxxx.apps.googleusercontent.com"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          autoComplete="off"
        />
        <a
          className="apikey-link"
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank" rel="noreferrer"
        >
          Create a Client ID →
        </a>
      </div>

      <div className="nblm-field">
        <label className="nblm-label">MCP bridge URL</label>
        <input
          className="config-input"
          placeholder="https://your-bridge.example.com/mcp"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          autoComplete="off"
        />
        <p className="nblm-hint">
          Must expose <code>list_notebooks</code>, <code>send_chat</code>, and
          <code> upload_source</code> as MCP tools.
        </p>
      </div>

      <button className="btn-primary nblm-continue" disabled={!ready} onClick={handleContinue}>
        Continue →
      </button>
      <p className="apikey-note">Credentials are stored locally on this device only.</p>
    </div>
  );
}

// ── Phase 2: Google sign-in ──────────────────────────────────────────────
function LoginPhase({ onSignIn, error }) {
  return (
    <div className="nblm-login">
      <div className="nblm-login-icon">🔐</div>
      <h2 className="nblm-login-title">Sign in with Google</h2>
      <p className="nblm-login-desc">
        Log in to your Google account to access your NotebookLM notebooks.
      </p>
      <button className="nblm-google-btn" onClick={onSignIn}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Sign in with Google
      </button>
      {error && <div className="practice-error">⚠️ {error}</div>}
    </div>
  );
}

// ── Phase 3: Notebook picker ─────────────────────────────────────────────
function NotebooksPhase({ notebooks, isLoading, error, onRefresh, onSelect }) {
  return (
    <div className="nblm-picker">
      <div className="nblm-picker-header">
        <h3 className="nblm-picker-title">Your notebooks</h3>
        <button className="action-btn" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {error && <div className="practice-error">⚠️ {error}</div>}

      {!isLoading && notebooks.length === 0 && !error && (
        <div className="nblm-empty">
          <div className="nblm-empty-icon">📭</div>
          <p>No notebooks found for this account.</p>
          <p className="nblm-empty-hint">Create one at <a className="apikey-link" href="https://notebooklm.google.com" target="_blank" rel="noreferrer">notebooklm.google.com</a>.</p>
        </div>
      )}

      <div className="nblm-list">
        {notebooks.map((nb) => (
          <button key={nb.id} className="nblm-card" onClick={() => onSelect(nb)}>
            <div className="nblm-card-emoji">{nb.emoji || '📘'}</div>
            <div className="nblm-card-body">
              <div className="nblm-card-title">{nb.title || nb.name || 'Untitled notebook'}</div>
              {nb.sourceCount != null && (
                <div className="nblm-card-sub">{nb.sourceCount} source{nb.sourceCount === 1 ? '' : 's'}</div>
              )}
              {nb.updatedAt && !nb.sourceCount && (
                <div className="nblm-card-sub">Updated {new Date(nb.updatedAt).toLocaleDateString()}</div>
              )}
            </div>
            <span className="nblm-card-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Phase 4: Voice chat bubble ───────────────────────────────────────────
function VoiceBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`pb-row ${isUser ? 'pb-row--user' : 'pb-row--ai'}`}>
      {!isUser && <div className="pb-avatar">📓</div>}
      <div className={`pb-bubble ${isUser ? 'pb-bubble--user' : 'pb-bubble--ai'}`}>
        <p className="pb-text">{msg.content}</p>
        {msg.citations && msg.citations.length > 0 && (
          <div className="nblm-citations">
            {msg.citations.map((c, i) => (
              <span key={i} className="nblm-citation">[{i + 1}] {c.title || c.source || 'source'}</span>
            ))}
          </div>
        )}
      </div>
      {isUser && <div className="pb-avatar pb-avatar--user">🧑</div>}
    </div>
  );
}

function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Main ─────────────────────────────────────────────────────────────────
export default function NotebookLMScreen({ onBack }) {
  const nb = useNotebookLM();
  const speech = useSpeechRecognition('en-US');
  const { speak, stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const recorder = useAudioRecorder();

  const [phase, setPhase] = useState(() => {
    const s = nb.settings;
    if (!s.googleClientId || !s.mcpServerUrl) return 'setup';
    return 'login';
  });
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // After sign-in, auto-load notebooks and flip phase
  useEffect(() => {
    if (nb.isSignedIn && phase === 'login') {
      nb.loadNotebooks();
      setPhase('notebooks');
    }
  }, [nb.isSignedIn, phase]); // eslint-disable-line

  // When a notebook is selected, enter voice mode
  useEffect(() => {
    if (nb.selectedNotebook && phase === 'notebooks') setPhase('voice');
  }, [nb.selectedNotebook, phase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [nb.messages]);

  // Populate textbox from ongoing speech recognition
  useEffect(() => {
    if (speech.transcript) setInputText(speech.transcript);
  }, [speech.transcript]);

  const handleSend = async (text) => {
    const t = (text || inputText).trim();
    if (!t || nb.isLoading) return;
    setInputText('');
    stopSpeaking();
    await nb.sendMessage(t);
  };

  // Auto-send when speech recognition ends
  const wasListening = useRef(false);
  useEffect(() => {
    const justStopped = wasListening.current && !speech.isListening;
    wasListening.current = speech.isListening;
    if (justStopped) {
      const t = speech.getLastTranscript();
      if (t.trim()) handleSend(t);
    }
  }, [speech.isListening]); // eslint-disable-line

  // Read out assistant replies
  useEffect(() => {
    if (!nb.messages.length) return;
    const last = nb.messages[nb.messages.length - 1];
    if (last.role === 'assistant' && last.content) speak(last.content, 'en-US', null);
  }, [nb.messages.length]); // eslint-disable-line

  const handleToggleMic = () => {
    if (speech.isListening) speech.stopListening();
    else { stopSpeaking(); speech.startListening(); }
  };

  const handleToggleRecord = async () => {
    if (recorder.isRecording) {
      const blob = await recorder.stop();
      if (blob) {
        try {
          await nb.uploadAudio(blob, `voice-note-${Date.now()}.webm`);
        } catch { /* error surfaces via nb.error */ }
      }
    } else {
      stopSpeaking();
      speech.stopListening();
      recorder.start();
    }
  };

  const handleChangeNotebook = () => {
    stopSpeaking();
    speech.stopListening();
    if (recorder.isRecording) recorder.cancel();
    nb.selectNotebook(null);
    setPhase('notebooks');
    nb.loadNotebooks();
  };

  const header = (title, right = null) => (
    <div className="practice-header">
      <button className="icon-btn" onClick={onBack} aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>
      <span className="practice-title">{title}</span>
      {right || <div style={{ width: 40 }} />}
    </div>
  );

  // ── Phase: setup ──
  if (phase === 'setup') {
    return (
      <div className="practice-screen">
        {header('📓 NotebookLM Voice')}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px' }}>
          <SetupPhase
            settings={nb.settings}
            onSaveClientId={nb.setGoogleClientId}
            onSaveServerUrl={nb.setMcpServerUrl}
            onContinue={() => setPhase('login')}
          />
        </div>
      </div>
    );
  }

  // ── Phase: login ──
  if (phase === 'login') {
    return (
      <div className="practice-screen">
        {header('📓 NotebookLM Voice', (
          <button className="provider-badge-btn" onClick={() => setPhase('setup')} title="Edit settings">
            ⚙️
          </button>
        ))}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px', display: 'flex' }}>
          <LoginPhase onSignIn={nb.signIn} error={nb.error} />
        </div>
      </div>
    );
  }

  // ── Phase: notebook picker ──
  if (phase === 'notebooks') {
    return (
      <div className="practice-screen">
        {header('Choose a notebook', (
          <button className="provider-badge-btn" onClick={nb.signOut} title="Sign out">
            {nb.user?.picture
              ? <img src={nb.user.picture} alt="" className="nblm-avatar-img" />
              : <>👤</>}
          </button>
        ))}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px' }}>
          <NotebooksPhase
            notebooks={nb.notebooks}
            isLoading={nb.isLoading}
            error={nb.error}
            onRefresh={nb.loadNotebooks}
            onSelect={nb.selectNotebook}
          />
        </div>
      </div>
    );
  }

  // ── Phase: voice chat ──
  return (
    <div className="practice-screen">
      <div className="practice-header">
        <button className="icon-btn" onClick={handleChangeNotebook} aria-label="Change notebook">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="practice-header-center">
          <span className="practice-topic-emoji">{nb.selectedNotebook?.emoji || '📓'}</span>
          <span className="practice-topic-name">
            {nb.selectedNotebook?.title || nb.selectedNotebook?.name || 'Notebook'}
          </span>
          {isSpeaking && <span className="nblm-live-chip">🔊 Speaking…</span>}
        </div>
        <button className="provider-badge-btn" onClick={nb.signOut} title="Sign out">
          {nb.user?.picture
            ? <img src={nb.user.picture} alt="" className="nblm-avatar-img" />
            : <>👤</>}
        </button>
      </div>

      <div className="practice-chat">
        {nb.messages.map((msg, idx) => (
          <VoiceBubble key={idx} msg={msg} />
        ))}
        {nb.isLoading && (
          <div className="pb-row pb-row--ai">
            <div className="pb-avatar">📓</div>
            <div className="pb-bubble pb-bubble--ai pb-thinking"><span /><span /><span /></div>
          </div>
        )}
        {nb.error && (
          <div className="practice-error">
            ⚠️ {nb.error}
            <button className="practice-error-switch" onClick={() => setPhase('setup')}>
              Edit settings →
            </button>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {recorder.isRecording && (
        <div className="nblm-recording-bar">
          <span className="nblm-rec-dot" />
          Recording… {formatDuration(recorder.durationMs)}
          <button className="action-btn action-btn--danger nblm-rec-cancel" onClick={recorder.cancel}>Cancel</button>
        </div>
      )}

      <div className="practice-input-bar">
        <input
          className="practice-input"
          placeholder={speech.isListening ? 'Listening…' : 'Ask your notebook…'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={nb.isLoading || recorder.isRecording}
        />
        <button
          className={`practice-mic-btn ${speech.isListening ? 'practice-mic-btn--active' : ''}`}
          onClick={handleToggleMic}
          disabled={nb.isLoading || recorder.isRecording || !speech.isSupported}
          title={speech.isListening ? 'Stop listening' : 'Speak to NotebookLM'}
        >
          {speech.isListening ? '⏹' : '🎤'}
        </button>
        <button
          className={`nblm-upload-btn ${recorder.isRecording ? 'nblm-upload-btn--active' : ''}`}
          onClick={handleToggleRecord}
          disabled={nb.isLoading}
          title={recorder.isRecording ? 'Stop & upload to notebook' : 'Record and upload audio as a source'}
        >
          {recorder.isRecording ? '⬆️' : '📥'}
        </button>
        <button
          className="practice-send-btn"
          onClick={() => handleSend()}
          disabled={nb.isLoading || !inputText.trim()}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
