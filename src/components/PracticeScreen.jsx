import { useState, useRef, useEffect } from 'react';
import { TOPICS, LEVELS, useClaudeConversation } from '../hooks/useClaudeConversation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import TopicSelector from './TopicSelector';
import FeedbackPanel from './FeedbackPanel';

// ── API Key setup screen ──────────────────────────────────────────────────
function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('');
  return (
    <div className="apikey-screen">
      <div className="apikey-icon">🔑</div>
      <h2 className="apikey-title">Cần API Key</h2>
      <p className="apikey-desc">
        Chế độ luyện nói dùng Claude AI.<br />
        Nhập Anthropic API key của bạn để bắt đầu.
      </p>
      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noreferrer"
        className="apikey-link"
      >
        Lấy API key miễn phí →
      </a>
      <input
        className="config-input apikey-input"
        type="password"
        placeholder="sk-ant-api03-..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && key.startsWith('sk-') && onSave(key)}
      />
      <button
        className="btn-primary"
        disabled={!key.startsWith('sk-')}
        onClick={() => onSave(key)}
      >
        Xác nhận & Bắt đầu
      </button>
      <p className="apikey-note">Key được lưu trên thiết bị, không gửi đi nơi khác.</p>
    </div>
  );
}

// ── Chat message bubble ───────────────────────────────────────────────────
function PracticeBubble({ msg, onFeedbackToggle, showFeedback }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`pb-row ${isUser ? 'pb-row--user' : 'pb-row--ai'}`}>
      {!isUser && <div className="pb-avatar">🤖</div>}
      <div className={`pb-bubble ${isUser ? 'pb-bubble--user' : 'pb-bubble--ai'}`}>
        <p className="pb-text">{msg.content}</p>
        {isUser && msg.feedback && (
          <button
            className={`pb-feedback-toggle ${showFeedback ? 'pb-feedback-toggle--open' : ''}`}
            onClick={onFeedbackToggle}
          >
            {showFeedback ? '▲ Ẩn nhận xét' : '▼ Xem nhận xét'}
            {msg.feedback.score != null && (
              <span
                className="pb-score-chip"
                style={{
                  background:
                    msg.feedback.score >= 80 ? '#43e97b22' :
                    msg.feedback.score >= 60 ? '#f9c74f22' : '#f7258522',
                  color:
                    msg.feedback.score >= 80 ? '#43e97b' :
                    msg.feedback.score >= 60 ? '#f9c74f' : '#f72585',
                }}
              >
                {msg.feedback.score}/100
              </span>
            )}
          </button>
        )}
        {isUser && msg.feedback && showFeedback && <FeedbackPanel feedback={msg.feedback} />}
      </div>
      {isUser && <div className="pb-avatar pb-avatar--user">🧑</div>}
    </div>
  );
}

// ── Main Practice Screen ──────────────────────────────────────────────────
export default function PracticeScreen({ onBack }) {
  const [phase, setPhase] = useState('setup'); // setup | chat
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[1]);
  const [openFeedbacks, setOpenFeedbacks] = useState({}); // msgIndex -> bool
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const conv = useClaudeConversation();
  const speech = useSpeechRecognition('en-US');
  const { speak, stopSpeaking } = useSpeechSynthesis();

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv.messages]);

  // Fill input from speech
  useEffect(() => {
    if (speech.transcript) setInputText(speech.transcript);
  }, [speech.transcript]);

  // Auto-send when speech stops
  const wasListening = useRef(false);
  useEffect(() => {
    const justStopped = wasListening.current && !speech.isListening;
    wasListening.current = speech.isListening;
    if (justStopped) {
      const t = speech.getLastTranscript();
      if (t.trim()) handleSend(t);
    }
  }, [speech.isListening]); // eslint-disable-line

  // Speak AI replies automatically
  useEffect(() => {
    if (conv.messages.length === 0) return;
    const last = conv.messages[conv.messages.length - 1];
    if (last.role === 'assistant' && last.content) {
      speak(last.content, 'en-US', null);
    }
  }, [conv.messages.length]); // eslint-disable-line

  const handleStart = async () => {
    await conv.startConversation(selectedTopic, selectedLevel);
    setOpenFeedbacks({});
    setPhase('chat');
  };

  const handleSend = async (text) => {
    const t = (text || inputText).trim();
    if (!t || conv.isLoading) return;
    setInputText('');
    stopSpeaking();
    await conv.sendMessage(t, selectedTopic, selectedLevel);
  };

  const toggleFeedback = (idx) =>
    setOpenFeedbacks((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // ── API key gate ──
  if (!conv.apiKey) {
    return (
      <div className="practice-screen">
        <div className="practice-header">
          <button className="icon-btn" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <span className="practice-title">🎓 Luyện Nói Tiếng Anh</span>
          <div style={{ width: 40 }} />
        </div>
        <ApiKeySetup onSave={conv.saveApiKey} />
      </div>
    );
  }

  // ── Topic selection ──
  if (phase === 'setup') {
    return (
      <div className="practice-screen">
        <div className="practice-header">
          <button className="icon-btn" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <span className="practice-title">🎓 Luyện Nói Tiếng Anh</span>
          <button
            className="action-btn"
            onClick={() => conv.saveApiKey('')}
            title="Change API key"
          >
            🔑
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px' }}>
          <TopicSelector
            selectedTopic={selectedTopic}
            selectedLevel={selectedLevel}
            onSelect={(t, l) => {
              if (t) setSelectedTopic(t);
              if (l) setSelectedLevel(l);
            }}
            onStart={handleStart}
          />
        </div>
      </div>
    );
  }

  // ── Chat phase ──
  return (
    <div className="practice-screen">
      {/* Header */}
      <div className="practice-header">
        <button className="icon-btn" onClick={() => { conv.resetConversation(); setPhase('setup'); }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="practice-header-center">
          <span className="practice-topic-emoji">{selectedTopic.emoji}</span>
          <span className="practice-topic-name">{selectedTopic.name}</span>
          <span className="practice-level-chip">{selectedLevel.label}</span>
        </div>
        <button
          className="action-btn"
          onClick={() => conv.saveApiKey('')}
          title="Change API key"
        >
          🔑
        </button>
      </div>

      {/* Chat area */}
      <div className="practice-chat">
        {conv.messages.map((msg, idx) => (
          <PracticeBubble
            key={idx}
            msg={msg}
            showFeedback={!!openFeedbacks[idx]}
            onFeedbackToggle={() => toggleFeedback(idx)}
          />
        ))}
        {conv.isLoading && (
          <div className="pb-row pb-row--ai">
            <div className="pb-avatar">🤖</div>
            <div className="pb-bubble pb-bubble--ai pb-thinking">
              <span /><span /><span />
            </div>
          </div>
        )}
        {conv.error && (
          <div className="practice-error">⚠️ {conv.error}</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="practice-input-bar">
        <input
          className="practice-input"
          placeholder="Type in English…"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={conv.isLoading}
        />
        <button
          className={`practice-mic-btn ${speech.isListening ? 'practice-mic-btn--active' : ''}`}
          onClick={() => speech.isListening ? speech.stopListening() : speech.startListening()}
          disabled={conv.isLoading}
          title={speech.isListening ? 'Stop recording' : 'Speak in English'}
        >
          {speech.isListening ? '⏹' : '🎤'}
        </button>
        <button
          className="practice-send-btn"
          onClick={() => handleSend()}
          disabled={conv.isLoading || !inputText.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
