import type { FeedEntry, NormalisedReel } from "@cxr/types";

/** Derived state for whichever slide is currently active. */
export interface ActiveSlideState {
  /** True when the active slide is an ad, or a fullscreen ad break is on screen over a reel. */
  isAdActive: boolean;
  /** The active reel's data, or undefined when the active slide is a bare ad (or out of range). */
  activeReel: NormalisedReel | undefined;
}

/**
 * Derives action-rail visibility state from the active feed entry.
 *
 * The action rail hides while an ad slide or a fullscreen ad break is on
 * screen — ads own their own overlay/CTA chrome.
 *
 * @param entries          The feed's entries.
 * @param activeIndex      Index of the currently active slide.
 * @param isAdBreakActive  True while a fullscreen ad break overlay is showing over a reel.
 */
export function getActiveSlideState(
  entries: FeedEntry[],
  activeIndex: number,
  isAdBreakActive: boolean
): ActiveSlideState {
  const activeEntry = entries[activeIndex];
  return {
    isAdActive: activeEntry?.kind === "ad" || isAdBreakActive,
    activeReel:
      activeEntry?.kind === "video" || activeEntry?.kind === "video-with-ad" ? activeEntry.data : undefined,
  };
}
