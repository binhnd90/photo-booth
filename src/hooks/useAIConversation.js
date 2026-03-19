import { useState, useCallback, useRef } from 'react';

// ── Providers ─────────────────────────────────────────────────────────────
export const PROVIDERS = [
  {
    id: 'anthropic',
    name: 'Claude',
    vendor: 'Anthropic',
    logo: '🟣',
    models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6'],
    defaultModel: 'claude-haiku-4-5-20251001',
    keyHint: 'sk-ant-api03-…',
    keyPrefix: 'sk-ant',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    logo: '🟢',
    models: ['gpt-4o-mini', 'gpt-4o'],
    defaultModel: 'gpt-4o-mini',
    keyHint: 'sk-proj-…',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    logo: '🔵',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash',
    keyHint: 'AIzaSy…',
    keyPrefix: 'AIza',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
];

// ── Topics ────────────────────────────────────────────────────────────────
export const BUILTIN_TOPICS = [
  {
    id: 'daily',
    emoji: '☀️',
    name: 'Daily Life',
    nameVi: 'Cuộc sống hàng ngày',
    context: 'Casual everyday conversation about daily routines, hobbies, family, and lifestyle.',
    starter: "Hi! Let's chat about your daily life. What did you do today?",
    custom: false,
  },
  {
    id: 'job',
    emoji: '💼',
    name: 'Job Interview',
    nameVi: 'Phỏng vấn xin việc',
    context: 'A professional job interview. Play the role of an interviewer at a tech company.',
    starter: "Welcome! Please have a seat. Can you start by telling me a little about yourself?",
    custom: false,
  },
  {
    id: 'restaurant',
    emoji: '🍜',
    name: 'Restaurant',
    nameVi: 'Gọi đồ ăn',
    context: 'A restaurant scene where the AI plays a friendly waiter and the user is a customer.',
    starter: "Good evening! Welcome to our restaurant. Here's your menu. Can I start you off with something to drink?",
    custom: false,
  },
  {
    id: 'travel',
    emoji: '✈️',
    name: 'Travel',
    nameVi: 'Du lịch',
    context: 'Travel-related conversation: booking hotels, asking for directions, visiting tourist spots.',
    starter: "Oh, you're traveling! Where are you headed? Have you planned everything out yet?",
    custom: false,
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    name: 'Shopping',
    nameVi: 'Mua sắm',
    context: 'A shopping scenario. The AI is a helpful store assistant.',
    starter: "Hi there! Welcome to our store. Are you looking for something specific today, or just browsing?",
    custom: false,
  },
  {
    id: 'friends',
    emoji: '🤝',
    name: 'Making Friends',
    nameVi: 'Kết bạn',
    context: 'Casual conversation between two people meeting for the first time and getting to know each other.',
    starter: "Hey! Are you new here? I don't think we've met before — I'm Alex. What's your name?",
    custom: false,
  },
];

export const LEVELS = [
  { id: 'beginner',     label: 'Beginner',     labelVi: 'Người mới',   description: 'Simple words & short sentences' },
  { id: 'intermediate', label: 'Intermediate', labelVi: 'Trung cấp',   description: 'Moderate complexity' },
  { id: 'advanced',     label: 'Advanced',     labelVi: 'Nâng cao',     description: 'Natural fluent conversation' },
];

// ── Custom topics (localStorage) ─────────────────────────────────────────
const CUSTOM_KEY = 'vt-custom-topics';

export function loadCustomTopics() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch { return []; }
}

export function saveCustomTopics(topics) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(topics));
}

// ── System prompt ─────────────────────────────────────────────────────────
function buildSystemPrompt(topic, level) {
  return `You are an AI English conversation partner helping a Vietnamese learner practice speaking English.

Topic: ${topic.name}
Scenario: ${topic.context}
Learner level: ${level.label} — ${level.description}

YOUR RULES:
1. Engage naturally in the conversation scenario (keep replies to 2-3 sentences — short and natural)
2. Adapt vocabulary complexity to the learner's level
3. Analyze their English after EVERY user message

ALWAYS respond with ONLY a valid JSON object — no markdown fences, no extra text:
{
  "reply": "Your natural in-character English response",
  "feedback": {
    "score": <integer 0-100 representing English quality>,
    "corrections": [
      {"original": "wrong phrase", "corrected": "correct phrase", "explanation": "why"}
    ],
    "praise": "One specific thing they did well (or null if nothing notable)",
    "tip": "One short grammar or vocabulary tip relevant to this message",
    "new_word": {"word": "...", "meaning": "...", "example": "..."} or null
  }
}

If corrections is empty ([]), the learner's English was perfect.
Score guide: 100=perfect, 80+=good, 60-79=some mistakes, below 60=needs work.`;
}

// ── API callers ───────────────────────────────────────────────────────────
async function callAnthropic(apiKey, model, systemPrompt, history) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: 600, system: systemPrompt, messages: history }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `Anthropic error ${resp.status}`);
  return data.content[0]?.text ?? '';
}

async function callOpenAI(apiKey, model, systemPrompt, history) {
  const messages = [{ role: 'system', content: systemPrompt }, ...history];
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 600, messages }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `OpenAI error ${resp.status}`);
  return data.choices[0]?.message?.content ?? '';
}

async function callGemini(apiKey, model, systemPrompt, history) {
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 600 },
      }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || `Gemini error ${resp.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callProvider(providerId, apiKey, model, systemPrompt, history) {
  switch (providerId) {
    case 'anthropic': return callAnthropic(apiKey, model, systemPrompt, history);
    case 'openai':    return callOpenAI(apiKey, model, systemPrompt, history);
    case 'gemini':    return callGemini(apiKey, model, systemPrompt, history);
    default: throw new Error(`Unknown provider: ${providerId}`);
  }
}

// ── Settings storage ──────────────────────────────────────────────────────
const SETTINGS_KEY = 'vt-ai-settings';

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch { return {}; }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ── Hook ─────────────────────────────────────────────────────────────────
export function useAIConversation() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [settings, setSettingsState] = useState(() => {
    const s = loadSettings();
    return {
      providerId: s.providerId || 'anthropic',
      keys: s.keys || {},          // { anthropic: '...', openai: '...', gemini: '...' }
      models: s.models || {},      // { anthropic: '...', openai: '...', gemini: '...' }
    };
  });

  const historyRef = useRef([]);

  const updateSettings = useCallback((patch) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const currentProvider = PROVIDERS.find((p) => p.id === settings.providerId) || PROVIDERS[0];
  const currentApiKey = settings.keys[settings.providerId] || '';
  const currentModel = settings.models[settings.providerId] || currentProvider.defaultModel;

  const setApiKey = useCallback((key) => {
    updateSettings({ keys: { ...loadSettings().keys, [settings.providerId]: key.trim() } });
  }, [settings.providerId, updateSettings]);

  const setProvider = useCallback((id) => {
    updateSettings({ providerId: id });
    setError(null);
  }, [updateSettings]);

  const setModel = useCallback((model) => {
    updateSettings({ models: { ...loadSettings().models, [settings.providerId]: model } });
  }, [settings.providerId, updateSettings]);

  const startConversation = useCallback(async (topic) => {
    setMessages([]);
    setError(null);
    historyRef.current = [{ role: 'assistant', content: topic.starter }];
    setMessages([{ role: 'assistant', content: topic.starter, feedback: null }]);
  }, []);

  const sendMessage = useCallback(async (userText, topic, level) => {
    if (!userText.trim() || isLoading) return;
    setError(null);

    const userMsg = { role: 'user', content: userText };
    historyRef.current = [...historyRef.current, userMsg];
    setMessages((prev) => [...prev, { role: 'user', content: userText, feedback: null }]);
    setIsLoading(true);

    try {
      const raw = await callProvider(
        settings.providerId,
        currentApiKey,
        currentModel,
        buildSystemPrompt(topic, level),
        historyRef.current,
      );

      let parsed;
      try {
        const cleaned = raw.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { reply: raw, feedback: null };
      }

      const aiMsg = { role: 'assistant', content: parsed.reply, feedback: parsed.feedback ?? null };
      historyRef.current = [...historyRef.current, { role: 'assistant', content: parsed.reply }];
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err.message || 'API error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, settings.providerId, currentApiKey, currentModel]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    historyRef.current = [];
  }, []);

  return {
    messages, isLoading, error,
    settings, currentProvider, currentApiKey, currentModel,
    setApiKey, setProvider, setModel,
    startConversation, sendMessage, resetConversation,
  };
}
