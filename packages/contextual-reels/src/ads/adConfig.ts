import type { GenAdInitOptions } from "@cxr/ads/normalizers";
import { normalizeBannerConfig, normalizeNativeConfig, normalizeVideoConfig } from "@cxr/ads/normalizers";
import type { NormalisedAd } from "@cxr/types";

/** Provider-config keys of GenAdInitOptions (excludes callbacks). */
export type AdProviderConfig = Pick<GenAdInitOptions, "banner" | "native" | "video">;

/**
 * Assemble the provider-config portion of GenAd.init options from a normalised ad entry.
 *
 * Only populates keys where the underlying normalizer returns a value.
 * Callbacks (onWaterfallSuccess, onAdCompleted, etc.) are NOT included — those
 * are wired by `useGenAdInstance`.
 *
 * @param ad         Normalised ad entry (API-sourced or static).
 * @param bannerSize Physical slot dimensions as [width, height] for banner sizing.
 */
export function buildGenAdInitOptions(ad: NormalisedAd, bannerSize: [number, number]): AdProviderConfig {
  const result: AdProviderConfig = {};

  const banner = normalizeBannerConfig(ad.displayAd, bannerSize);
  if (banner) result.banner = banner;

  const native = normalizeNativeConfig(ad.nativeAd);
  if (native) result.native = native;

  const video = normalizeVideoConfig(
    ad.videoAd,
    { video: ad.videoPlatform, banner: ad.displayPlatform, native: ad.nativePlatform },
    ad.videoAdAdvertiserDetails,
    ad.videoAdContentVideo
  );
  if (video) result.video = video;

  return result;
}
