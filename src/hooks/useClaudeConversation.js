import { useState, useCallback, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';

// ── Topics ────────────────────────────────────────────────────────────────
export const TOPICS = [
  {
    id: 'daily',
    emoji: '☀️',
    name: 'Daily Life',
    nameVi: 'Cuộc sống hàng ngày',
    context: 'Casual everyday conversation about daily routines, hobbies, family, and lifestyle.',
    starter: 'Hi! Let\'s chat about your daily life. What did you do today?',
  },
  {
    id: 'job',
    emoji: '💼',
    name: 'Job Interview',
    nameVi: 'Phỏng vấn xin việc',
    context: 'A professional job interview. Play the role of an interviewer at a tech company.',
    starter: 'Welcome! Please have a seat. Can you start by telling me a little about yourself?',
  },
  {
    id: 'restaurant',
    emoji: '🍜',
    name: 'Restaurant',
    nameVi: 'Gọi đồ ăn',
    context: 'A restaurant scene where the AI plays a friendly waiter and the user is a customer.',
    starter: 'Good evening! Welcome to our restaurant. Here\'s your menu. Can I start you off with something to drink?',
  },
  {
    id: 'travel',
    emoji: '✈️',
    name: 'Travel',
    nameVi: 'Du lịch',
    context: 'Travel-related conversation: booking hotels, asking for directions, visiting tourist spots.',
    starter: 'Oh, you\'re traveling! Where are you headed? Have you planned everything out yet?',
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    name: 'Shopping',
    nameVi: 'Mua sắm',
    context: 'A shopping scenario. The AI is a helpful store assistant.',
    starter: 'Hi there! Welcome to our store. Are you looking for something specific today, or just browsing?',
  },
  {
    id: 'friends',
    emoji: '🤝',
    name: 'Making Friends',
    nameVi: 'Kết bạn',
    context: 'Casual conversation between two people meeting for the first time and getting to know each other.',
    starter: 'Hey! Are you new here? I don\'t think we\'ve met before — I\'m Alex. What\'s your name?',
  },
];

export const LEVELS = [
  { id: 'beginner',     label: 'Beginner',     labelVi: 'Người mới',     description: 'Simple words & short sentences' },
  { id: 'intermediate', label: 'Intermediate', labelVi: 'Trung cấp',     description: 'Moderate complexity' },
  { id: 'advanced',     label: 'Advanced',     labelVi: 'Nâng cao',       description: 'Natural fluent conversation' },
];

// ── System prompt factory ─────────────────────────────────────────────────
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

If corrections is empty ([]), the learner's English was perfect for that message.
Score guide: 100=perfect, 80+=good, 60-79=some mistakes, below 60=needs work.`;
}

// ── Hook ─────────────────────────────────────────────────────────────────
export function useClaudeConversation() {
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', content, feedback?}
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vt-anthropic-key') || '');
  const clientRef = useRef(null);
  const historyRef = useRef([]); // raw {role, content} for API

  const saveApiKey = useCallback((key) => {
    const k = key.trim();
    setApiKey(k);
    localStorage.setItem('vt-anthropic-key', k);
    clientRef.current = null; // reset client
  }, []);

  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
    return clientRef.current;
  }, [apiKey]);

  // Initialize conversation with AI starter message
  const startConversation = useCallback(async (topic, level) => {
    setMessages([]);
    setError(null);
    historyRef.current = [];

    // Add the AI starter as first message (no feedback for opener)
    const starterMsg = { role: 'assistant', content: topic.starter, feedback: null };
    setMessages([starterMsg]);
    historyRef.current = [{ role: 'assistant', content: topic.starter }];
  }, []);

  const sendMessage = useCallback(async (userText, topic, level) => {
    if (!userText.trim() || isLoading) return;
    setError(null);

    // Append user message immediately
    const userMsg = { role: 'user', content: userText };
    historyRef.current = [...historyRef.current, userMsg];
    setMessages((prev) => [...prev, { role: 'user', content: userText, feedback: null }]);
    setIsLoading(true);

    try {
      const client = getClient();
      const resp = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: buildSystemPrompt(topic, level),
        messages: historyRef.current,
      });

      const raw = resp.content[0]?.text ?? '{}';
      let parsed;
      try {
        // Strip any accidental markdown fences
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
  }, [isLoading, getClient]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    historyRef.current = [];
  }, []);

  return {
    messages, isLoading, error,
    apiKey, saveApiKey,
    startConversation, sendMessage, resetConversation,
  };
}
