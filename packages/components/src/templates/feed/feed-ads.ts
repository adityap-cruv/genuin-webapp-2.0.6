import { useMemo, useRef } from "react";

import type { AdTagObjectType, PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

/** Brand IDs for which static video ads are injected into the feed. */
export const AD_INJECT_BRAND_ID = [3283, 2249, 2910];

export const EXPAND_VIEW_AD_CONFIGS = [
  {
    videoSource: "https://vz-8bbc7bbf-a1e.b-cdn.net/738f9e12-141d-4c56-8357-16b71a68debd/play_360p.mp4",
    adUrl: "https://media.begenuin.com/ad-sdk/test-creatives/finance.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/splitero.webp",
    primaryColor: "#F97316",
  },
  {
    videoSource: "https://vz-8bbc7bbf-a1e.b-cdn.net/2f4ed7d2-b4db-4925-b1e5-3d7a314a0307/play_360p.mp4",
    adUrl: "https://media.begenuin.com/ad-sdk/test-creatives/consumerserivce.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/airtasker.webp",
    primaryColor: "#061257",
  },
  {
    videoSource: "https://vz-8bbc7bbf-a1e.b-cdn.net/4b01ccd6-4da4-4128-b17d-26714707fd69/play_360p.mp4",
    adUrl: "https://media.begenuin.com/ad-sdk/test-creatives/foodandgroceryads.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/impossiblefoods.webp",
    primaryColor: "#E10600",
  },
  {
    videoSource: "https://vz-8bbc7bbf-a1e.b-cdn.net/09c2567e-73bd-4aca-9348-987da7c7cd20/play_360p.mp4",
    adUrl: "https://media.begenuin.com/ad-sdk/test-creatives/soda.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/skypop.webp",
    primaryColor: "#061257",
  },
] as const;

type StaticVideoAdEntry = NonNullable<
  NonNullable<AdTagObjectType["video_ad"]> extends (infer U)[] ? U : AdTagObjectType["video_ad"]
>;

export function buildStaticVideoAdEntry(idx: number): StaticVideoAdEntry {
  const cfg = EXPAND_VIEW_AD_CONFIGS[idx % EXPAND_VIEW_AD_CONFIGS.length]!;
  return {
    url: cfg.adUrl,
    ads_url: cfg.adUrl,
    cpm: 0.001,
    // advertiserDetails: { logo: cfg.logo, primaryColor: cfg.primaryColor },
    contentVideo: { url: cfg.videoSource, autoplay: true, loop: true, muted: true, objectFit: "contain" },
  };
}

/**
 * For house_ad items (type "ads" with a video), appends a deterministic static video_ad
 * entry from EXPAND_VIEW_AD_CONFIGS to the end of the video_ad array.
 * Operates on the existing feed items without inserting new ones.
 */
export function appendStaticVideoAdToHouseAds(feed: PostDetailsType[]): PostDetailsType[] {
  let adCounter = 0;
  return feed.map((item) => {
    const isHouseAd = (item as { type?: string }).type === "ads" && !!item.video;
    if (!isHouseAd) return item;

    const adTagObject = (item as { adTagObject?: AdTagObjectType }).adTagObject;
    if (!adTagObject) return item;

    const staticEntry = buildStaticVideoAdEntry(adCounter++);
    const existingVideoAd = adTagObject.video_ad;
    const updatedVideoAd = Array.isArray(existingVideoAd)
      ? [...existingVideoAd, staticEntry]
      : existingVideoAd
        ? [existingVideoAd, staticEntry]
        : [staticEntry];

    return {
      ...item,
      adTagObject: { ...adTagObject, video_ad: updatedVideoAd },
    } as PostDetailsType;
  });
}

/**
 * Manages ad injection across paginated feed updates.
 *
 * - webapp: enriches existing house_ad items with static video_ad entries (appendStaticVideoAdToHouseAds).
 * - sdk, expand view open, shouldInjectExpandViewAds=true: inserts synthetic ad items between videos (injectAdsForExpandView).
 * - sdk, collapsed or flag off: returns rawVideos unchanged.
 *
 * @param rawVideos - The current flat list of feed items from pagination.
 * @param brandId - The active brand's numeric id, used to gate webapp injection.
 * @param showExpandView - Whether the expand/fullscreen view is currently active.
 * @param platform - Rendering context: "webapp" or "sdk".
 * @param shouldInjectExpandViewAds - SDK-only flag: enables synthetic ad insertion in expand view.
 * @returns The processed feed array, or rawVideos unchanged when no injection applies.
 */
export function useAdInjectedFeed(
  rawVideos: PostDetailsType[],
  brandId: number | undefined,
  showExpandView: boolean,
  platform: "webapp" | "sdk",
  shouldInjectExpandViewAds: boolean = false
): PostDetailsType[] {
  // injectedFeedRef holds the last stable result so pagination doesn't re-randomize existing slots.
  const injectedFeedRef = useRef<PostDetailsType[]>([]);
  const rawBaseRef = useRef<PostDetailsType[]>([]);

  return useMemo(() => {
    // sdk: inject synthetic ads between videos when expand view is open and flag is on
    if (platform === "sdk") {
      if (shouldInjectExpandViewAds && showExpandView) {
        return injectAdsForExpandView(rawVideos);
      }
      injectedFeedRef.current = [];
      rawBaseRef.current = [];
      return rawVideos;
    }

    // webapp: enrich existing house_ad items; skip if brand not in allowlist
    if (!brandId || !AD_INJECT_BRAND_ID.includes(brandId)) {
      injectedFeedRef.current = [];
      rawBaseRef.current = [];
      return rawVideos;
    }

    const prev = rawBaseRef.current;
    // rawVideos grows by appending; detect new tail items only to avoid re-randomizing existing slots.
    if (rawVideos.length > prev.length && rawVideos.slice(0, prev.length).every((v, i) => v === prev[i])) {
      const newItems = rawVideos.slice(prev.length);
      injectedFeedRef.current = appendStaticVideoAdToHouseAds([...injectedFeedRef.current, ...newItems]);
    } else {
      // Full reset on filter change, refetch, or collapse→expand transition.
      injectedFeedRef.current = appendStaticVideoAdToHouseAds(rawVideos);
    }

    rawBaseRef.current = rawVideos;
    return injectedFeedRef.current;
  }, [rawVideos, brandId, showExpandView, platform, shouldInjectExpandViewAds]);
}

function createInjectableAdItem(
  videoSource: string,
  adUrl: string,
  logo: string,
  primaryColor: string,
  idx: number
): PostDetailsType {
  return {
    type: "ads",
    adTagObject: {
      display_ad: null,
      native_ad: null,
      video_ad: {
        url: adUrl,
        ads_url: adUrl,
        cpm: 0.001,
        advertiserDetails: { logo, primaryColor },
        contentVideo: { url: videoSource, autoplay: true, loop: true, muted: true, objectFit: "contain" },
      },
      order: ["video_ad", "display_ad", "house_ad"],
    },
    video: {
      id: `injected-ad-${idx}`,
      type: "video",
      source: videoSource,
      adUrl,
      adsPlatform: "aniview",
      createdAt: null,
      commentCount: 0,
      viewCount: 0,
      shareUrl: "",
      attachedLink: null,
      isSparked: false,
      isWatched: false,
      sparkCount: 0,
      thumbnail: "",
      thumbnailM: null,
      description: null,
      descritptionText: null,
      slug: `injected-ad-${idx}`,
      linkoutId: null,
      clickableUrl: null,
      linkouts: [],
      isPinned: false,
      thumbnailSprite: null,
      cardLayoutId: null,
      videoLayoutId: null,
      duration: null,
      attributes: null,
      placement_card_layout_id: null,
      placement_video_layout_id: null,
      placement_card_section_layout_id: null,
    },
  } as PostDetailsType;
}

/**
 * Interleaves synthetic ad items after every non-ad, non-special video in the feed.
 * Used in expand-view only for selected placements/embeds (gated by shouldInjectExpandViewAds).
 */
export function injectAdsForExpandView(feed: PostDetailsType[]): PostDetailsType[] {
  const result: PostDetailsType[] = [];
  let adCounter = 0;

  for (const item of feed) {
    result.push(item);

    const isAlreadyAd = (item as { type?: string }).type === "ads";
    const isSpecialSlide = item.video?.type === "complete" || item.video?.type === "overlay";

    if (!isAlreadyAd && !isSpecialSlide) {
      const cfg = EXPAND_VIEW_AD_CONFIGS[Math.floor(Math.random() * EXPAND_VIEW_AD_CONFIGS.length)]!;
      result.push(createInjectableAdItem(cfg.videoSource, cfg.adUrl, cfg.logo, cfg.primaryColor, adCounter));
      adCounter++;
    }
  }

  return result;
}
