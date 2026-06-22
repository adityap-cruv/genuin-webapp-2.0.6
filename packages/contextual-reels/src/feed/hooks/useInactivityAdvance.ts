/**
 * 10-second inactivity timer that auto-advances the feed.
 *
 * Only active when `isActive=true`. Resets on pointer, touch, or click events
 * on the window. Calls `onAdvance()` when the timer fires.
 */
import { useEffect, useRef } from "react";

/** Default inactivity timeout in milliseconds. */
const DEFAULT_TIMEOUT_MS = 10_000;

interface UseInactivityAdvanceOptions {
  /** Whether the timer should be running. Set false to suspend. */
  isActive: boolean;
  /** Called when inactivity timeout fires. */
  onAdvance: () => void;
  /** Override the default 10s timeout. */
  timeoutMs?: number;
}

/**
 * Install an inactivity auto-advance timer.
 *
 * @param options  isActive flag, onAdvance callback, optional timeoutMs.
 */
export function useInactivityAdvance(options: UseInactivityAdvanceOptions): void {
  const { isActive, onAdvance, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    function startTimer(): void {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onAdvanceRef.current();
      }, timeoutMs);
    }

    function resetTimer(): void {
      startTimer();
    }

    startTimer();

    window.addEventListener("pointerdown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      window.removeEventListener("pointerdown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [isActive, timeoutMs]);
}
