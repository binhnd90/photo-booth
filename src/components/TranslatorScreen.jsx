import { useState, useEffect, useRef, useCallback } from 'react';
import Avatar from './Avatar';
import RecordButton from './RecordButton';
import TranscriptDisplay from './TranscriptDisplay';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function TranslatorScreen({
  avatarConfig,
  translation,
  onBack,
  onConfigureAvatar,
}) {
  const [viText, setViText] = useState('');
  const [enText, setEnText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [appState, setAppState] = useState('idle'); // idle | listening | translating | speaking

  const {
    transcript,
    isListening,
    isSupported,
    error: recogError,
    startListening,
    stopListening,
    getLastTranscript,
  } = useSpeechRecognition();

  const { translate, isLoading, loadingProgress, loadingMessage } = translation;
  const { speak, stopSpeaking, isSpeaking } = useSpeechSynthesis();

  // Keep viText in sync with live transcript
  useEffect(() => {
    if (transcript) setViText(transcript);
  }, [transcript]);

  // When listening stops → translate
  const wasListeningRef = useRef(false);

  useEffect(() => {
    const justStopped = wasListeningRef.current && !isListening;
    wasListeningRef.current = isListening;

    if (justStopped) {
      const text = getLastTranscript();
      if (text.trim()) doTranslate(text);
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync overall app state
  useEffect(() => {
    if (isListening) setAppState('listening');
    else if (isTranslating) setAppState('translating');
    else if (isSpeaking) setAppState('speaking');
    else setAppState('idle');
  }, [isListening, isTranslating, isSpeaking]);

  const doTranslate = useCallback(
    async (text) => {
      setIsTranslating(true);
      try {
        const translated = await translate(text);
        setEnText(translated);
        if (translated) speak(translated, avatarConfig.voiceURI);
      } finally {
        setIsTranslating(false);
      }
    },
    [translate, speak, avatarConfig.voiceURI]
  );

  const handleToggleRecord = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      setViText('');
      setEnText('');
      startListening();
    }
  };

  const statusMessage = () => {
    if (isLoading) return loadingMessage;
    if (!isSupported) return 'Speech recognition not supported in this browser.';
    if (recogError) return recogError;
    if (appState === 'listening') return 'Listening… speak in Vietnamese';
    if (appState === 'translating') return 'Translating…';
    if (appState === 'speaking') return 'Tap to stop speaking';
    return 'Tap the mic to start speaking';
  };

  const recordDisabled = isLoading || isTranslating || !isSupported;

  return (
    <div className="translator-screen">
      {/* Header */}
      <div className="translator-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        <div className="lang-badge">
          <span>🇻🇳 VI</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
          <span>🇺🇸 EN</span>
        </div>

        <button className="icon-btn" onClick={onConfigureAvatar} aria-label="Settings">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
      </div>

      {/* Model loading progress bar */}
      {isLoading && (
        <div className="loading-bar-wrap">
          <div className="loading-bar-track">
            <div
              className="loading-bar-fill"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="loading-bar-label">{loadingMessage}</span>
        </div>
      )}

      {/* Avatar */}
      <div className="avatar-area">
        <Avatar config={avatarConfig} state={appState} />
      </div>

      {/* Status */}
      <p className="status-text">{statusMessage()}</p>

      {/* Transcript */}
      <TranscriptDisplay
        vietnamese={viText}
        english={enText}
        isTranslating={isTranslating}
      />

      {/* Record button */}
      <div className="record-area">
        <RecordButton
          isListening={isListening || isSpeaking}
          isDisabled={recordDisabled}
          onToggle={handleToggleRecord}
        />
      </div>
    </div>
  );
}
