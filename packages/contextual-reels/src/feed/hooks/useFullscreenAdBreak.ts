/**
 * Ad break state machine for organic videos.
 *
 *   idle → requesting → playing → completed → (cover hold) → idle | failed
 *               └──fail──▶ failed (video keeps playing)
 *
 * Requesting is non-blocking (slot mounted invisible). On completion the
 * black cover lingers for COMPLETED_COVER_MS while the carousel advances.
 * The break runs in every view (outer and expanded) — one ad attempt per slide
 * activation. (The slot's own unmute gate still defers the actual SDK request
 * until the video is unmuted, so a muted outer view requests nothing yet.)
 */
import { useCallback, useEffect, useRef, useState } from "react";

import type { AdProviderKind } from "@cxr/ads/normalizers";
import type { NormalisedAd } from "@cxr/types";
import { createLogger } from "@cxr/utils/logger";

const log = createLogger("cxr/fullscreen-ad-break");

/** Overlay opacity fade duration in ms. */
export const AD_FADE_MS = 300;

/** Post-completion cover hold in ms — must outlast the Embla scroll animation. */
export const COMPLETED_COVER_MS = 700;

/** Lifecycle states of the fullscreen ad break. */
export type FullscreenAdBreakStatus = "idle" | "requesting" | "playing" | "failed" | "completed";

/** Options for {@link useFullscreenAdBreak}. */
export interface UseFullscreenAdBreakOptions {
  isActive: boolean;
  /** Ad config for this reel — absent means the break never activates. */
  adObject: NormalisedAd | undefined;
  /** Called once when the ad finishes — caller advances to the next video. */
  onAdComplete?: () => void;
}

/** Result of {@link useFullscreenAdBreak}. */
export interface UseFullscreenAdBreakResult {
  status: FullscreenAdBreakStatus;
  /** Mount the GenAdSlot (requesting or playing). */
  shouldMountAd: boolean;
  /** Keep the overlay div mounted — includes the post-completion cover hold. */
  isOverlayMounted: boolean;
  /** Overlay opacity target. */
  isAdVisible: boolean;
  /** Pause the underlying video (ad on screen or cover up). */
  suppressVideo: boolean;
  handleWaterfallSuccess: (provider: AdProviderKind) => void;
  handleWaterfallFail: () => void;
  handleAdCompleted: () => void;
}

/**
 * Drive the fullscreen ad break for one organic video.
 *
 * @param options  isActive, isFullScreen, adObject, onAdComplete.
 */
export function useFullscreenAdBreak(options: UseFullscreenAdBreakOptions): UseFullscreenAdBreakResult {
  const { isActive, adObject, onAdComplete } = options;
  const [status, setStatus] = useState<FullscreenAdBreakStatus>("idle");

  const onAdCompleteRef = useRef(onAdComplete);
  onAdCompleteRef.current = onAdComplete;

  const inBreakViewRef = useRef(isActive);
  inBreakViewRef.current = isActive;

  const adId = adObject?.id;

  useEffect(() => {
    if (adId == null) return;

    if (!isActive) {
      // completed survives slide-away so the cover holds; timer releases it.
      setStatus((prev) => (prev === "completed" ? prev : "idle"));
      return;
    }

    // Request in every view (outer + expanded). Only fire from idle —
    // failed/completed stay terminal until the slide deactivates.
    setStatus((prev) => {
      if (prev !== "idle") return prev;
      log.info("ad requested", { adId });
      return "requesting";
    });
  }, [isActive, adId]);

  // Release the completion cover once the feed transition has settled.
  useEffect(() => {
    if (status !== "completed") return;
    const timer = setTimeout(() => {
      // Still on this slide (last item, nothing to advance to) → failed,
      // so the video resumes without looping another ad.
      setStatus(inBreakViewRef.current ? "failed" : "idle");
    }, COMPLETED_COVER_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const handleWaterfallSuccess = useCallback(
    (provider: AdProviderKind) => {
      log.info("ad fill", { adId, provider });
      setStatus((prev) => (prev === "requesting" ? "playing" : prev));
    },
    [adId]
  );

  const handleWaterfallFail = useCallback(() => {
    log.info("ad no-fill — video continues", { adId });
    setStatus("failed");
  }, [adId]);

  const handleAdCompleted = useCallback(() => {
    log.info("ad completed — advancing feed", { adId });
    setStatus("completed");
    onAdCompleteRef.current?.();
  }, [adId]);

  return {
    status,
    shouldMountAd: status === "requesting" || status === "playing",
    isOverlayMounted: status === "requesting" || status === "playing" || status === "completed",
    isAdVisible: status === "playing" || status === "completed",
    suppressVideo: status === "playing" || status === "completed",
    handleWaterfallSuccess,
    handleWaterfallFail,
    handleAdCompleted,
  };
}
