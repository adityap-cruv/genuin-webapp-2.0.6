"use client";
import { useEffect } from "react";

import { onFloatingVideoClear, onFloatingVideoPromote } from "./events";
import { getFloatingVideoSession, hasPendingFloatingVideoRestore } from "./session-store";

const FLOATING_HOST_SELECTOR = '[data-genuin-floating-video="true"]';

/**
 * Keeps exactly one player audible while a floating session is in flight, with the floating
 * player winning.
 *
 * The floating player lives in the SDK's React root and the destination page's players live
 * in the app root, so neither knows about the other and no shared registry spans them. What
 * they do share is the document, so arbitration happens there.
 *
 * The floating video is the one the user explicitly carried across the navigation, so it
 * keeps playing and anything the destination route autoplays is paused instead. Without this
 * the destination's own feed would silently steal playback the moment it mounted. A player
 * the user starts by hand still wins — that is handled by ending the session, not here.
 *
 * The listener only exists while a session is active, so ordinary pages keep whatever
 * multi-player behaviour they had.
 */
export function useFloatingVideoAudioGuard(): void {
  useEffect(() => {
    let detachGuard: (() => void) | null = null;

    const attachGuard = () => {
      if (detachGuard) return;

      const handlePlay = (event: Event) => {
        const started = event.target;
        if (!(started instanceof HTMLMediaElement)) return;
        if (started.closest(FLOATING_HOST_SELECTOR)) {
          // The floating player resuming silences everything else.
          for (const media of document.querySelectorAll<HTMLMediaElement>("video, audio")) {
            if (media === started || media.paused || media.muted) continue;
            if (!media.closest(FLOATING_HOST_SELECTOR)) media.pause();
          }
          return;
        }

        // During a restore the card is on its way out and the incoming full-size player is
        // the one the user asked for, so it must not be silenced by the card it replaces.
        if (hasPendingFloatingVideoRestore()) return;
        // Something on the destination route started on its own. Yield to the floating video
        // that the user deliberately brought with them, but only while it is actually playing.
        const floating = document.querySelector<HTMLMediaElement>(`${FLOATING_HOST_SELECTOR} video`);
        if (!floating || floating.paused || floating.ended) return;
        started.pause();
      };

      // Capture phase: `play` does not bubble.
      document.addEventListener("play", handlePlay, true);
      detachGuard = () => document.removeEventListener("play", handlePlay, true);
    };

    if (getFloatingVideoSession()) attachGuard();
    const offPromote = onFloatingVideoPromote(attachGuard);
    const offClear = onFloatingVideoClear(() => {
      detachGuard?.();
      detachGuard = null;
    });

    return () => {
      offPromote();
      offClear();
      detachGuard?.();
    };
  }, []);
}
