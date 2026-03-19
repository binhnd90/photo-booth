import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    function loadVoices() {
      setVoices(speechSynthesis.getVoices());
    }
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  /**
   * @param {string} text
   * @param {string} lang  - BCP-47 tag, e.g. 'en-US' or 'vi-VN'
   * @param {string|null} voiceURI - preferred voice (optional)
   */
  const speak = useCallback((text, lang = 'en-US', voiceURI = null) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const allVoices = speechSynthesis.getVoices();
    if (voiceURI) {
      const v = allVoices.find((v) => v.voiceURI === voiceURI);
      if (v) utterance.voice = v;
    } else {
      // Best-effort: prefer local voice matching the lang
      const best =
        allVoices.find((v) => v.lang === lang && v.localService) ||
        allVoices.find((v) => v.lang === lang) ||
        allVoices.find((v) => v.lang.startsWith(lang.split('-')[0]));
      if (best) utterance.voice = best;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  /** Voices filtered by language prefix, useful for config screens */
  const voicesFor = useCallback(
    (lang) => voices.filter((v) => v.lang.startsWith(lang.split('-')[0])),
    [voices]
  );

  return { speak, stopSpeaking, isSpeaking, voices, voicesFor };
}
