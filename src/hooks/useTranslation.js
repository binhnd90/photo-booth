import { useState, useEffect, useRef, useCallback } from 'react';

export function useTranslation() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading AI model...');
  const [error, setError] = useState(null);
  const translatorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const { pipeline, env } = await import('@huggingface/transformers');
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        setLoadingMessage('Downloading translation model...');

        translatorRef.current = await pipeline(
          'translation',
          'Xenova/opus-mt-vi-en',
          {
            progress_callback: (info) => {
              if (cancelled) return;
              if (info.status === 'progress') {
                const pct = Math.round(info.progress || 0);
                setLoadingMessage(`Downloading model… ${pct}%`);
                setLoadingProgress(pct);
              } else if (info.status === 'initiate') {
                setLoadingMessage(`Loading ${info.file || 'model'}...`);
              } else if (info.status === 'done') {
                setLoadingMessage('Model ready!');
                setLoadingProgress(100);
              }
            },
          }
        );

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Failed to load model: ${err.message}`);
          setIsLoading(false);
        }
      }
    }

    loadModel();
    return () => { cancelled = true; };
  }, []);

  const translate = useCallback(async (text) => {
    if (!translatorRef.current || !text.trim()) return '';
    const result = await translatorRef.current(text);
    return result[0]?.translation_text ?? '';
  }, []);

  return { translate, isLoading, loadingProgress, loadingMessage, error };
}
