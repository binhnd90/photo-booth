import { useState, useRef, useEffect, useCallback } from 'react';
import Avatar from './Avatar';
import ConversationHistory from './ConversationHistory';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useConversationHistory } from '../hooks/useConversationHistory';

export default function TranslatorScreen({ avatar1, avatar2, translation, onBack, onConfigureAvatars }) {
  // avatar1 = Vietnamese speaker (left), avatar2 = English speaker (right)

  const [state1, setState1] = useState('idle'); // avatar1 animation state
  const [state2, setState2] = useState('idle'); // avatar2 animation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeLang, setActiveLang] = useState(null); // 'vi' | 'en' | null

  const speechVi = useSpeechRecognition('vi-VN');
  const speechEn = useSpeechRecognition('en-US');
  const { speak, stopSpeaking, isSpeaking } = useSpeechSynthesis();
  const { messages, addMessage, clearHistory, exportAsText } = useConversationHistory();
  const { translateViToEn, translateEnToVi, isLoading, loadingProgress, loadingMessage } = translation;

  // ── Handle VI recording stop ─────────────────────────────────────────────
  const wasListeningVi = useRef(false);
  useEffect(() => {
    const justStopped = wasListeningVi.current && !speechVi.isListening;
    wasListeningVi.current = speechVi.isListening;
    if (justStopped) {
      const text = speechVi.getLastTranscript();
      if (text.trim()) doTranslate('vi', text);
    }
  }, [speechVi.isListening]); // eslint-disable-line

  // ── Handle EN recording stop ─────────────────────────────────────────────
  const wasListeningEn = useRef(false);
  useEffect(() => {
    const justStopped = wasListeningEn.current && !speechEn.isListening;
    wasListeningEn.current = speechEn.isListening;
    if (justStopped) {
      const text = speechEn.getLastTranscript();
      if (text.trim()) doTranslate('en', text);
    }
  }, [speechEn.isListening]); // eslint-disable-line

  // ── Sync avatar animation states ─────────────────────────────────────────
  useEffect(() => {
    if (speechVi.isListening) {
      setState1('listening'); setState2('idle');
    } else if (speechEn.isListening) {
      setState1('idle'); setState2('listening');
    } else if (isTranslating) {
      if (activeLang === 'vi') { setState1('idle'); setState2('translating'); }
      else                     { setState1('translating'); setState2('idle'); }
    } else if (isSpeaking) {
      if (activeLang === 'vi') { setState1('idle'); setState2('speaking'); }
      else                     { setState1('speaking'); setState2('idle'); }
    } else {
      setState1('idle'); setState2('idle');
    }
  }, [speechVi.isListening, speechEn.isListening, isTranslating, isSpeaking, activeLang]);

  // ── Core translate + speak ───────────────────────────────────────────────
  const doTranslate = useCallback(async (lang, text) => {
    setActiveLang(lang);
    setIsTranslating(true);
    try {
      let translated;
      if (lang === 'vi') {
        translated = await translateViToEn(text);
        addMessage({ speakerName: avatar1.name, lang: 'vi', original: text, translated });
        speak(translated, 'en-US', avatar2.voiceURI);
      } else {
        translated = await translateEnToVi(text);
        addMessage({ speakerName: avatar2.name, lang: 'en', original: text, translated });
        speak(translated, 'vi-VN', avatar1.voiceURI);
      }
    } finally {
      setIsTranslating(false);
    }
  }, [translateViToEn, translateEnToVi, addMessage, speak, avatar1, avatar2]);

  // ── Button handlers ──────────────────────────────────────────────────────
  const handleViToggle = () => {
    if (isSpeaking) { stopSpeaking(); return; }
    if (speechVi.isListening) { speechVi.stopListening(); }
    else { speechEn.stopListening(); speechVi.startListening(); }
  };

  const handleEnToggle = () => {
    if (isSpeaking) { stopSpeaking(); return; }
    if (speechEn.isListening) { speechEn.stopListening(); }
    else { speechVi.stopListening(); speechEn.startListening(); }
  };

  const btnDisabled = isLoading || isTranslating;
  const viActive = speechVi.isListening || (isSpeaking && activeLang === 'en'); // en result → vi avatar speaks
  const enActive = speechEn.isListening || (isSpeaking && activeLang === 'vi'); // vi result → en avatar speaks

  return (
    <div className="translator-screen">
      {/* ── Header ── */}
      <div className="translator-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        <div className="header-actions">
          {messages.length > 0 && (
            <>
              <button
                className="action-btn"
                onClick={() => exportAsText(avatar1.name, avatar2.name)}
                title="Export conversation"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z" />
                </svg>
                Export
              </button>
              <button
                className="action-btn action-btn--danger"
                onClick={clearHistory}
                title="Clear conversation"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
            </>
          )}
          <button className="icon-btn" onClick={onConfigureAvatars} aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Loading bar ── */}
      {isLoading && (
        <div className="loading-bar-wrap">
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${loadingProgress}%` }} />
          </div>
          <span className="loading-bar-label">{loadingMessage}</span>
        </div>
      )}

      {/* ── Two avatars ── */}
      <div className="two-avatars">
        <div className="avatar-side avatar-side--left">
          <Avatar config={avatar1} state={state1} size="small" />
          <div className="avatar-lang-tag">🇻🇳 VI</div>
        </div>

        <div className="avatar-vs">↔</div>

        <div className="avatar-side avatar-side--right">
          <Avatar config={avatar2} state={state2} size="small" />
          <div className="avatar-lang-tag">EN 🇺🇸</div>
        </div>
      </div>

      {/* ── Chat history ── */}
      <ConversationHistory messages={messages} avatar1={avatar1} avatar2={avatar2} />

      {/* ── Mic buttons ── */}
      <div className="mic-bar">
        <button
          className={`mic-btn mic-btn--vi ${viActive ? 'mic-btn--active' : ''}`}
          onClick={handleViToggle}
          disabled={btnDisabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          {speechVi.isListening ? 'Dừng lại' : '🇻🇳 Nói tiếng Việt'}
        </button>

        <button
          className={`mic-btn mic-btn--en ${enActive ? 'mic-btn--active' : ''}`}
          onClick={handleEnToggle}
          disabled={btnDisabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          {speechEn.isListening ? 'Stop' : '🇺🇸 Speak English'}
        </button>
      </div>
    </div>
  );
}
