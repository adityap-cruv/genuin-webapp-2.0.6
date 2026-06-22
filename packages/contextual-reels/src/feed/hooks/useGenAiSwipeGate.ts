/**
 * GenAI swipe gate hook.
 *
 * Listens to genai custom events to gate swipe navigation during AI interactions:
 * - genai:dataFetching  → disabled=true, status='data-fetching'
 * - genai:dataReceived  → disabled=true, status='data-loaded', pauses video
 * - genai:chatClosed    → disabled=false, status='none'
 *                         if identifier==='swipe-to-next': calls onAutoAdvance after 5000ms
 *
 * Events are consumed from the per-instance {@link CxrEventBus} rather than
 * from `window` to prevent cross-instance bleed when multiple widgets are
 * mounted on the same page.
 */
import { useEffect, useRef, useState } from "react";

import { useEventBus } from "@cxr/instance/coordination/EventBusContext";

/** Status of the GenAI data pipeline for the current reel. */
export type GenAiStatus = "none" | "data-fetching" | "data-loaded";

interface UseGenAiSwipeGateCallbacks {
  onAutoAdvance: () => void;
  onPauseVideo: () => void;
  onResumeVideo: () => void;
}

/**
 * Gate swipe navigation when the GenAI SDK is active for this reel.
 *
 * @param isActiveReel  Only register listeners when this reel is the active one.
 * @param callbacks     Action handlers for auto-advance and video playback control.
 * @returns `{ status, swipeDisabled }` reactive state.
 */
export function useGenAiSwipeGate(
  isActiveReel: boolean,
  callbacks: UseGenAiSwipeGateCallbacks
): { status: GenAiStatus; swipeDisabled: boolean } {
  const [status, setStatus] = useState<GenAiStatus>("none");
  const [swipeDisabled, setSwipeDisabled] = useState(false);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bus = useEventBus();

  useEffect(() => {
    if (!isActiveReel) return;

    const unsubFetching = bus.on("genai:dataFetching", () => {
      setStatus("data-fetching");
      setSwipeDisabled(true);
    });

    const unsubReceived = bus.on("genai:dataReceived", () => {
      setStatus("data-loaded");
      setSwipeDisabled(true);
      callbacksRef.current.onPauseVideo();
    });

    const unsubClosed = bus.on("genai:chatClosed", (detail) => {
      setStatus("none");
      setSwipeDisabled(false);
      callbacksRef.current.onResumeVideo();

      if (detail.identifier === "swipe-to-next") {
        if (autoAdvanceTimerRef.current !== null) {
          clearTimeout(autoAdvanceTimerRef.current);
        }
        autoAdvanceTimerRef.current = setTimeout(() => {
          callbacksRef.current.onAutoAdvance();
        }, 5_000);
      }
    });

    return () => {
      unsubFetching();
      unsubReceived();
      unsubClosed();
      if (autoAdvanceTimerRef.current !== null) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [isActiveReel, bus]);

  return { status, swipeDisabled };
}
