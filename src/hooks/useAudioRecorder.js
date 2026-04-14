import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useAudioRecorder — thin wrapper around MediaRecorder that returns a Blob
 * ready to upload (default: audio/webm; opus). Works on current Chromium,
 * Firefox and Safari 17+.
 */
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [durationMs, setDurationMs] = useState(0);

  const recorderRef = useRef(null);
  const streamRef   = useRef(null);
  const chunksRef   = useRef([]);
  const startedAtRef = useRef(0);
  const tickRef     = useRef(null);

  const pickMime = () => {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    for (const m of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(m)) return m;
    }
    return '';
  };

  const start = useCallback(async () => {
    setError(null);
    setDurationMs(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
      recorder.start(250);
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      tickRef.current = setInterval(
        () => setDurationMs(Date.now() - startedAtRef.current),
        200,
      );
      setIsRecording(true);
    } catch (err) {
      setError(err.message || 'Microphone access denied');
      setIsRecording(false);
    }
  }, []);

  const stop = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) { resolve(null); return; }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
        if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
        setIsRecording(false);
        resolve(blob);
      };
      try { recorder.stop(); }
      catch { setIsRecording(false); resolve(null); }
    });
  }, []);

  const cancel = useCallback(() => {
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setIsRecording(false);
    setDurationMs(0);
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { isRecording, durationMs, error, start, stop, cancel };
}
