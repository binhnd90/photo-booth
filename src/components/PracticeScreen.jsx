import { useState, useRef, useEffect } from 'react';
import { BUILTIN_TOPICS, LEVELS, PROVIDERS, useAIConversation } from '../hooks/useAIConversation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import TopicSelector from './TopicSelector';
import FeedbackPanel from './FeedbackPanel';

// ── Provider setup screen ────────────────────────────────────────────────
function ProviderSetup({ settings, currentProvider, currentApiKey, onSetProvider, onSetKey, onDone }) {
  const [keyInput, setKeyInput] = useState(currentApiKey);

  // Sync when provider changes
  useEffect(() => setKeyInput(currentApiKey), [currentApiKey]);

  const valid = keyInput.trim().length > 10;

  return (
    <div className="provider-setup">
      <div className="provider-setup-icon">🤖</div>
      <h2 className="provider-setup-title">Chọn AI Provider</h2>
      <p className="provider-setup-desc">Nhập API key để bắt đầu luyện nói tiếng Anh với AI.</p>

      {/* Provider tabs */}
      <div className="provider-tabs">
        {PROVIDERS.map((p) => {
          const hasKey = !!settings.keys[p.id];
          return (
            <button
              key={p.id}
              className={`provider-tab ${settings.providerId === p.id ? 'provider-tab--active' : ''}`}
              onClick={() => onSetProvider(p.id)}
            >
              <span>{p.logo}</span>
              <span className="provider-tab-name">{p.name}</span>
              {hasKey && <span className="provider-tab-check">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Key input for selected provider */}
      <div className="provider-key-box">
        <div className="provider-key-header">
          <span>{currentProvider.logo} {currentProvider.vendor} API Key</span>
          <a href={currentProvider.docsUrl} target="_blank" rel="noreferrer" className="apikey-link">
            Lấy key →
          </a>
        </div>
        <input
          className="config-input"
          type="password"
          placeholder={currentProvider.keyHint}
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && valid && onSetKey(keyInput)}
          autoComplete="off"
        />
        <button
          className="btn-primary provider-key-save"
          disabled={!valid}
          onClick={() => onSetKey(keyInput)}
        >
          Lưu key {currentProvider.name}
        </button>
      </div>

      {/* Show configured providers */}
      {Object.keys(settings.keys).filter((k) => settings.keys[k]).length > 0 && (
        <div className="provider-configured">
          <p className="config-label">Đã cấu hình:</p>
          <div className="provider-configured-list">
            {PROVIDERS.filter((p) => settings.keys[p.id]).map((p) => (
              <div
                key={p.id}
                className={`provider-configured-item ${settings.providerId === p.id ? 'provider-configured-item--active' : ''}`}
                onClick={() => onSetProvider(p.id)}
              >
                {p.logo} {p.name}
                {settings.providerId === p.id && <span className="provider-active-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        disabled={!settings.keys[settings.providerId]}
        onClick={onDone}
        style={{ marginTop: 8 }}
      >
        Tiếp tục →
      </button>
      <p className="apikey-note">Key lưu trên thiết bị, không gửi đi nơi khác ngoài API.</p>
    </div>
  );
}

// ── Chat bubble ──────────────────────────────────────────────────────────
function PracticeBubble({ msg, showFeedback, onFeedbackToggle }) {
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
                  background: msg.feedback.score >= 80 ? '#43e97b22' : msg.feedback.score >= 60 ? '#f9c74f22' : '#f7258522',
                  color:      msg.feedback.score >= 80 ? '#43e97b'   : msg.feedback.score >= 60 ? '#f9c74f'   : '#f72585',
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

// ── Main ─────────────────────────────────────────────────────────────────
export default function PracticeScreen({ onBack }) {
  const [phase, setPhase] = useState('setup'); // 'provider' | 'setup' | 'chat'
  const [selectedTopic, setSelectedTopic] = useState(BUILTIN_TOPICS[0]);
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[1]);
  const [openFeedbacks, setOpenFeedbacks] = useState({});
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const conv = useAIConversation();
  const speech = useSpeechRecognition('en-US');
  const { speak, stopSpeaking } = useSpeechSynthesis();

  // Decide initial phase
  useEffect(() => {
    if (!conv.currentApiKey) setPhase('provider');
    else setPhase('setup');
  }, []); // eslint-disable-line

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

  // Speak AI replies
  useEffect(() => {
    if (conv.messages.length === 0) return;
    const last = conv.messages[conv.messages.length - 1];
    if (last.role === 'assistant' && last.content) speak(last.content, 'en-US', null);
  }, [conv.messages.length]); // eslint-disable-line

  const handleStart = async () => {
    await conv.startConversation(selectedTopic);
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

  const handleSaveKey = (key) => {
    conv.setApiKey(key);
    setPhase('setup');
  };

  // ── Provider screen ──
  if (phase === 'provider') {
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px' }}>
          <ProviderSetup
            settings={conv.settings}
            currentProvider={conv.currentProvider}
            currentApiKey={conv.currentApiKey}
            onSetProvider={conv.setProvider}
            onSetKey={handleSaveKey}
            onDone={() => setPhase('setup')}
          />
        </div>
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
          <button className="provider-badge-btn" onClick={() => setPhase('provider')} title="Đổi AI provider">
            {conv.currentProvider.logo} {conv.currentProvider.name}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px' }}>
          <TopicSelector
            selectedTopic={selectedTopic}
            selectedLevel={selectedLevel}
            onSelect={(t, l) => { if (t) setSelectedTopic(t); if (l) setSelectedLevel(l); }}
            onStart={handleStart}
          />
        </div>
      </div>
    );
  }

  // ── Chat ──
  return (
    <div className="practice-screen">
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
        <button className="provider-badge-btn" onClick={() => setPhase('provider')} title="Đổi AI">
          {conv.currentProvider.logo}
        </button>
      </div>

      <div className="practice-chat">
        {conv.messages.map((msg, idx) => (
          <PracticeBubble
            key={idx}
            msg={msg}
            showFeedback={!!openFeedbacks[idx]}
            onFeedbackToggle={() => setOpenFeedbacks((p) => ({ ...p, [idx]: !p[idx] }))}
          />
        ))}
        {conv.isLoading && (
          <div className="pb-row pb-row--ai">
            <div className="pb-avatar">🤖</div>
            <div className="pb-bubble pb-bubble--ai pb-thinking"><span /><span /><span /></div>
          </div>
        )}
        {conv.error && (
          <div className="practice-error">
            ⚠️ {conv.error}
            <button className="practice-error-switch" onClick={() => setPhase('provider')}>
              Đổi provider →
            </button>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

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
          title={speech.isListening ? 'Stop' : 'Speak English'}
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
