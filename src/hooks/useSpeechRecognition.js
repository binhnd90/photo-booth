import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }

    const r = new SR();
    r.lang = 'vi-VN';
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    r.onend = () => {
      setIsListening(false);
    };

    r.onerror = (e) => {
      setIsListening(false);
      if (e.error !== 'no-speech') {
        setError(e.error === 'not-allowed'
          ? 'Microphone access denied. Please allow microphone in browser settings.'
          : `Error: ${e.error}`);
      }
    };

    r.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      transcriptRef.current = text;
      setTranscript(text);
    };

    recognitionRef.current = r;
  }, []);

  const startListening = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
    setError(null);
    try {
      recognitionRef.current?.start();
    } catch {
      // ignore already started error
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const getLastTranscript = useCallback(() => transcriptRef.current, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    getLastTranscript,
  };
}
