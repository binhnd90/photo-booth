import { useState, useEffect, useRef, useCallback } from 'react';

const MODEL_VI_EN = 'Xenova/opus-mt-vi-en';
const MODEL_EN_VI = 'Xenova/opus-mt-en-vi';

export function useTranslation() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading AI models…');
  const [error, setError] = useState(null);
  const pipelines = useRef({ viToEn: null, enToVi: null });

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        const { pipeline, env } = await import('@huggingface/transformers');
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        // ── Load VI → EN ─────────────────────────────────────────
        setLoadingMessage('Downloading VI→EN model…');
        pipelines.current.viToEn = await pipeline('translation', MODEL_VI_EN, {
          progress_callback: (info) => {
            if (cancelled) return;
            if (info.status === 'progress') {
              const pct = Math.round((info.progress || 0) / 2);
              setLoadingMessage(`VI→EN model… ${pct * 2}%`);
              setLoadingProgress(pct);
            }
          },
        });

        if (cancelled) return;
        setLoadingProgress(50);

        // ── Load EN → VI ─────────────────────────────────────────
        setLoadingMessage('Downloading EN→VI model…');
        pipelines.current.enToVi = await pipeline('translation', MODEL_EN_VI, {
          progress_callback: (info) => {
            if (cancelled) return;
            if (info.status === 'progress') {
              const pct = 50 + Math.round((info.progress || 0) / 2);
              setLoadingMessage(`EN→VI model… ${(pct - 50) * 2}%`);
              setLoadingProgress(pct);
            }
          },
        });

        if (!cancelled) {
          setLoadingProgress(100);
          setLoadingMessage('Models ready!');
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(`Failed to load models: ${err.message}`);
          setIsLoading(false);
        }
      }
    }

    loadModels();
    return () => { cancelled = true; };
  }, []);

  const translateViToEn = useCallback(async (text) => {
    if (!pipelines.current.viToEn || !text.trim()) return '';
    const result = await pipelines.current.viToEn(text);
    return result[0]?.translation_text ?? '';
  }, []);

  const translateEnToVi = useCallback(async (text) => {
    if (!pipelines.current.enToVi || !text.trim()) return '';
    const result = await pipelines.current.enToVi(text);
    return result[0]?.translation_text ?? '';
  }, []);

  return { translateViToEn, translateEnToVi, isLoading, loadingProgress, loadingMessage, error };
}
