/**
 * useMutePassbackGuard — for tags with the `mutePassback` strategy: starts a
 * timer (`mutePassbackDelayMs`, default 5s) when the first video begins playing
 * (the `player:play` bus event), NOT on mount — so the window measures muted
 * *playback*, not the feed/tag-load gap before any frame is shown. If the user
 * hasn't unmuted before the timer fires, calls `onAdFail` (passback). The timer
 * is armed once
 * (first play only) and cancelled if the user unmutes in time.
 *
 * Must be called from a component mounted inside StrategyProvider +
 * PlayerProvider + AdProvider + EventBusProvider. Side-effect only — returns
 * nothing.
 */
import { useEffect, useRef } from "react";

import { useEventBus } from "@cxr/instance/InstanceContext";
import { useAdWaterfall } from "@cxr/providers/AdProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import { isAdVerificationCrawler } from "@cxr/utils/ads";

export function useMutePassbackGuard(): void {
  const { mutePassback, mutePassbackDelayMs } = useStrategy();
  const { isMuted } = usePlayer();
  const { onAdFail } = useAdWaterfall();
  const bus = useEventBus();
  const firedRef = useRef(false);
  const armedRef = useRef(false);
  const filledRef = useRef(false);
  const isMutedRef = useRef(isMuted);
  // Skip passback for ad-verification crawlers (il.advtq present) — they can't
  // unmute, so firing passback against them produces false negatives.
  const bypassPassback = isAdVerificationCrawler();

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!mutePassback || bypassPassback) return;

    let timerId: number | undefined;

    // Once an ad fills, the placement has a terminal `ad:fill`; a later passback
    // `onAdFail` would emit ad:nofill after it — a double terminal event Google
    // reads as a malformed waterfall. Track fill so the timer can bail.
    const unsubFill = bus.on("ad:fill", () => {
      filledRef.current = true;
    });

    // Arm on the FIRST play only — a later pause/resume must not restart the
    // window or re-fire the passback.
    const unsub = bus.on("player:play", () => {
      if (armedRef.current) return;
      armedRef.current = true;

      timerId = window.setTimeout(() => {
        if (isMutedRef.current && !firedRef.current && !filledRef.current) {
          firedRef.current = true;
          onAdFail();
        }
      }, mutePassbackDelayMs);
    });

    return () => {
      unsub();
      unsubFill();
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
    // mutePassback, onAdFail, and bus are stable for a given tag — run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
