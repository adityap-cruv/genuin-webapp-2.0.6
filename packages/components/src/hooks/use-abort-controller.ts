import { useRef, useCallback } from "react";

export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const start = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    signal: abortControllerRef.current?.signal,
    start,
    abort,
  };
} 