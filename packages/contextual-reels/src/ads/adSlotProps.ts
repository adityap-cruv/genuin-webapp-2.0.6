/**
 * Maps a {@link NormalisedAd} onto the ad-payload props that {@link GenAdSlot}
 * forwards to the GenAd SDK.
 *
 * Both the in-feed ad slot ({@link AdLayout}) and the fullscreen ad break
 * ({@link VideoLayout}) drive the same SDK from the same `NormalisedAd` shape,
 * so the prop wiring lives here once. Spread the result into `<GenAdSlot>` and
 * supply the layout-specific props (id, callbacks, isActive, …) alongside it.
 */
import type { NormalisedAd } from "@cxr/types";

/** The subset of `GenAdSlot` props derived purely from the ad data. */
export interface GenAdSlotAdProps {
  isAudioAds: boolean;
  platforms: { video?: string; native?: string; banner?: string };
  displayAd: unknown;
  nativeAd: unknown;
  videoAd: unknown;
  videoAdAdvertiserDetails: NormalisedAd["videoAdAdvertiserDetails"];
  videoAdContentVideo: NormalisedAd["videoAdContentVideo"];
}

/**
 * Project the ad-payload props from a normalised ad.
 *
 * @param ad  The normalised ad to render.
 */
export function genAdSlotAdProps(ad: NormalisedAd): GenAdSlotAdProps {
  return {
    isAudioAds: ad.audioAds,
    platforms: { video: ad.videoPlatform, native: ad.nativePlatform, banner: ad.displayPlatform },
    displayAd: ad.displayAd,
    nativeAd: ad.nativeAd,
    videoAd: ad.videoAd,
    videoAdAdvertiserDetails: ad.videoAdAdvertiserDetails,
    videoAdContentVideo: ad.videoAdContentVideo,
  };
}
