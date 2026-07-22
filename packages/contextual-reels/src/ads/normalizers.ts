/**
 * Ad-pipeline types and normalizers — consolidated from:
 *   ads/types.ts
 *   ads/normalizeBannerConfig.ts
 *   ads/normalizeNativeConfig.ts
 *   ads/normalizeVideoConfig.ts
 */

import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/normalizers");

/**
 * Provider arrays beyond this size signal backend-contract drift: GenAd attempts every
 * entry, each adding to the HAI byte budget. We warn (not clip) so a long waterfall isn't
 * silently truncated.
 */
export const AD_PROVIDER_ARRAY_WARN_THRESHOLD = 10;

function warnIfOversizedProviderArray(kind: AdProviderKind, length: number): void {
  if (length > AD_PROVIDER_ARRAY_WARN_THRESHOLD) {
    logger.warn(
      `${kind} provider array has ${length} entries (> ${AD_PROVIDER_ARRAY_WARN_THRESHOLD}); ` +
        `GenAd will attempt every entry, each adding to the HAI byte budget. Check the backend waterfall contract.`
    );
  }
}

// ─── Ad pipeline types ────────────────────────────────────────────────────────

/** The three ad waterfall provider kinds that GenAd supports. */
export type AdProviderKind = "video" | "banner" | "native";

/**
 * Normalized configuration passed to `GenAd.init` for a display/banner ad.
 */
export interface BannerConfig {
  adUnitPath: string;
  networkCode: string | null;
  size: [number, number];
  platform: string;
}

/**
 * Normalized configuration passed to `GenAd.init` for a native ad.
 */
export interface NativeConfig {
  adUnitPath: string;
  networkCode: string | null;
  platform: string;
}

/**
 * Normalized configuration passed to `GenAd.init` for a video ad.
 */
export interface VideoConfig {
  vastUrl: string;
  platform: string;
  audioLayout: "full_video";
  /**
   * Gates GenAd's side-video render (the small clip beside the banner on the
   * 320×100 layout). GenAd defaults this to `false`; it must be explicitly true.
   * GenAd still self-restricts the side video to the "isShort" height band
   * (61–100px), so enabling it here is a no-op for taller layouts.
   */
  showVideo: boolean;
  advertiserDetails?: {
    logo?: string;
    primaryColor?: string;
    /**
     * Side-video source GenAd renders beside the banner (320×100). Set to the
     * ad's own resolved video URL so the current ad clip is what shows.
     */
    videoUrl?: string;
  };
  contentVideo?: {
    url: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    objectFit: string;
  };
}

/**
 * Full options object passed to `window.GenAd.init(...)`.
 */
export interface GenAdInitOptions {
  containerId: string;
  muted: boolean;
  banner?: BannerConfig | BannerConfig[];
  native?: NativeConfig | NativeConfig[];
  video?: VideoConfig | VideoConfig[];
  onWaterfallSuccess(provider: AdProviderKind): void;
  onWaterfallFail(provider: string): void;
  onAdCompleted(): void;
  onVolumeChange(data: { volume: number; isMuted: boolean }): void;
  onStageStart(data: { stage: string }): void;
  debug: boolean;
}

// ─── Banner config normalizer ─────────────────────────────────────────────────

/** Raw display-ad descriptor as returned by the feed API. */
interface RawDisplayAd {
  tag_id?: string;
  platform?: string;
}

/**
 * Extract the GAM network code from a tag_id path (e.g. `/123456/ad_unit` → `'123456'`).
 * Returns `null` when the path has no second segment.
 */
function getNetworkCodeFromTagId(tagId: string): string | null {
  return tagId.split("/")[1] || null;
}

/**
 * Normalize a raw display-ad value into the `BannerConfig` shape(s) that
 * `GenAd.init` expects.
 *
 * - `undefined` / `null` input → `undefined` (slot has no banner ad)
 * - Single object → single `BannerConfig`
 * - Array of objects → array of `BannerConfig`
 *
 * @param displayAd   Raw display-ad descriptor from the feed item.
 * @param bannerSize  Physical slot dimensions as `[width, height]`.
 * @returns Normalized config or `undefined` when no banner ad is present.
 */
export function normalizeBannerConfig(
  displayAd: unknown,
  bannerSize: [number, number]
): BannerConfig | BannerConfig[] | undefined {
  if (!displayAd) return undefined;

  const mapBanner = (ad: RawDisplayAd): BannerConfig => ({
    adUnitPath: ad.tag_id ?? "",
    networkCode: getNetworkCodeFromTagId(ad.tag_id ?? ""),
    size: bannerSize,
    platform: ad.platform ?? "",
  });

  if (Array.isArray(displayAd)) {
    warnIfOversizedProviderArray("banner", displayAd.length);
    return (displayAd as RawDisplayAd[]).map(mapBanner);
  }

  return mapBanner(displayAd as RawDisplayAd);
}

// ─── Native config normalizer ─────────────────────────────────────────────────

/** Raw native-ad descriptor as returned by the feed API. */
interface RawNativeAd {
  tag_id?: string;
  platform?: string;
}

/**
 * Normalize a raw native-ad value into the `NativeConfig` shape(s) that
 * `GenAd.init` expects.
 *
 * - `undefined` / `null` input → `undefined` (slot has no native ad)
 * - Single object → single `NativeConfig`
 * - Array of objects → array of `NativeConfig`
 *
 * @param nativeAd Raw native-ad descriptor from the feed item.
 * @returns Normalized config or `undefined` when no native ad is present.
 */
export function normalizeNativeConfig(nativeAd: unknown): NativeConfig | NativeConfig[] | undefined {
  if (!nativeAd) return undefined;

  const mapNative = (ad: RawNativeAd): NativeConfig => ({
    adUnitPath: ad.tag_id ?? "",
    networkCode: getNetworkCodeFromTagId(ad.tag_id ?? ""),
    platform: ad.platform ?? "",
  });

  if (Array.isArray(nativeAd)) {
    warnIfOversizedProviderArray("native", nativeAd.length);
    return (nativeAd as RawNativeAd[]).map(mapNative);
  }

  return mapNative(nativeAd as RawNativeAd);
}

// ─── Video config normalizer ──────────────────────────────────────────────────

/** Advertiser branding details. */
interface AdvertiserDetails {
  logo: string;
  primaryColor: string;
  /**
   * Fallback video source for GenAd's side video. GenAd resolves the side-video
   * URL from the branding API by brandId first, then falls back to this. Omit
   * when the branding API is expected to supply the clip.
   */
  videoUrl?: string;
}

/** Companion content-video descriptor. */
interface ContentVideo {
  url: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  objectFit: string;
}

/** Platform identifiers keyed by provider kind. */
interface Platforms {
  video?: string;
  banner?: string;
  native?: string;
}

/** Raw video-ad entry — can be a VAST URL string or a descriptor object. */
interface RawVideoAdObject {
  url?: string;
  ads_url?: string;
  vastUrl?: string;
  platform?: string;
  advertiserDetails?: AdvertiserDetails;
  contentVideo?: ContentVideo;
}

type RawVideoAd = string | RawVideoAdObject;

/**
 * Normalize a raw video-ad value into the `VideoConfig` shape(s) that
 * `GenAd.init` expects.
 *
 * - `undefined` / `null` input → `undefined`
 * - String input → single `VideoConfig` with `vastUrl` set to the string
 * - Object input → single `VideoConfig` reading `url`, `ads_url`, or `vastUrl`
 * - Array input → array of `VideoConfig`, entries with no URL are filtered out
 *
 * Per-entry `advertiserDetails` and `contentVideo` override the outer args.
 *
 * @param videoAd               Raw video ad value from the feed item.
 * @param platforms             Platform map from the tag config.
 * @param advertiserDetails     Advertiser branding to attach to all entries.
 * @param contentVideo          Companion content video for all entries.
 * @returns Normalized config(s) or `undefined`.
 */
export function normalizeVideoConfig(
  videoAd: unknown,
  platforms?: Platforms,
  advertiserDetails?: AdvertiserDetails,
  contentVideo?: ContentVideo
): VideoConfig | VideoConfig[] | undefined {
  if (!videoAd) return undefined;

  const buildEntry = (ad: RawVideoAd): VideoConfig | null => {
    const url =
      typeof ad === "string"
        ? ad
        : (ad as RawVideoAdObject).url || (ad as RawVideoAdObject).ads_url || (ad as RawVideoAdObject).vastUrl;

    if (!url) return null;

    const platform = (typeof ad === "object" && (ad as RawVideoAdObject).platform) || platforms?.video || "";

    const entryAdvertiserDetails =
      (typeof ad === "object" && (ad as RawVideoAdObject).advertiserDetails) || advertiserDetails;

    const entryContentVideo = (typeof ad === "object" && (ad as RawVideoAdObject).contentVideo) || contentVideo;

    // GenAd renders the side video from advertiserDetails.videoUrl. Default it to
    // the ad's own resolved video URL so the current clip is what shows, while
    // preserving any branding (logo/primaryColor) passed by the caller.
    const advertiserDetailsWithVideo = { ...(entryAdvertiserDetails ?? {}), videoUrl: url };

    return {
      vastUrl: url,
      platform,
      audioLayout: "full_video",
      // Enable GenAd's side video; GenAd's isShort height gate keeps it limited
      // to the 320×100 banner band.
      showVideo: true,
      advertiserDetails: advertiserDetailsWithVideo,
      ...(entryContentVideo ? { contentVideo: entryContentVideo } : {}),
    };
  };

  if (Array.isArray(videoAd)) {
    warnIfOversizedProviderArray("video", videoAd.length);
    return (videoAd as RawVideoAd[]).map(buildEntry).filter((e): e is VideoConfig => e !== null);
  }

  return buildEntry(videoAd as RawVideoAd) ?? undefined;
}
