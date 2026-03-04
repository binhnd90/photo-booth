import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    function loadVoices() {
      const all = speechSynthesis.getVoices();
      const enVoices = all.filter((v) => v.lang.startsWith('en'));
      setVoices(enVoices);
      if (enVoices.length > 0 && !selectedVoiceURI) {
        const usVoice =
          enVoices.find((v) => v.lang === 'en-US' && v.localService) ||
          enVoices.find((v) => v.lang === 'en-US') ||
          enVoices[0];
        setSelectedVoiceURI(usVoice.voiceURI);
      }
    }

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const speak = useCallback(
    (text, overrideVoiceURI) => {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const uri = overrideVoiceURI ?? selectedVoiceURI;
      if (uri) {
        const voice = speechSynthesis.getVoices().find((v) => v.voiceURI === uri);
        if (voice) utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [selectedVoiceURI]
  );

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stopSpeaking, isSpeaking, voices, selectedVoiceURI, setSelectedVoiceURI };
}
