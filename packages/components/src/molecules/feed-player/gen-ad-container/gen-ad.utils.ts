import type { AdTagObjectType } from "@genuin/components/react-query/api/feed/schema";

import type { GenAdBannerConfig, GenAdConfig, GenAdNativeConfig, GenAdVideoConfig } from "./gen-ad.types";

export function extractNetworkCode(tagId: string): string {
  return tagId.split("/").filter(Boolean)[0] ?? "";
}

/**
 * Smallest [width, height] tuple across the banner config(s). Returns `null`
 * when no banner is requested (video/native-only waterfalls don't need a
 * fixed slot size). Used by `<GenAdContainer>` to suppress the ad request
 * when the slot is too small to host the requested creative size —
 * rendering a 300×250 banner in a 200×200 slot is off-spec per IAB
 * guidelines and the impression would not be viewable.
 */
export function getMinBannerSize(banner: GenAdBannerConfig | GenAdBannerConfig[] | undefined): [number, number] | null {
  if (!banner) return null;
  const list = Array.isArray(banner) ? banner : [banner];
  if (list.length === 0) return null;
  let minW = Infinity;
  let minH = Infinity;
  for (const entry of list) {
    const [w, h] = entry.size;
    if (w < minW) minW = w;
    if (h < minH) minH = h;
  }
  if (!Number.isFinite(minW) || !Number.isFinite(minH)) return null;
  return [minW, minH];
}

type DisplayAdItem = NonNullable<Extract<AdTagObjectType["display_ad"], { tag_id: string }>>;
type NativeAdItem = NonNullable<Extract<AdTagObjectType["native_ad"], { tag_id: string }>>;
type VideoAdItem = NonNullable<Extract<AdTagObjectType["video_ad"], { ads_url: string }>>;

function mapBannerAdItem(ad: DisplayAdItem): GenAdBannerConfig {
  return {
    networkCode: extractNetworkCode(ad.tag_id),
    adUnitPath: ad.tag_id,
    size: [300, 250],
    platform: ad.platform,
  };
}

function mapNativeAdItem(ad: NativeAdItem): GenAdNativeConfig {
  return {
    networkCode: extractNetworkCode(ad.tag_id),
    adUnitPath: ad.tag_id,
    platform: ad.platform,
  };
}

function mapVideoAdItem(videoAd: VideoAdItem): GenAdVideoConfig {
  return {
    vastUrl: videoAd.ads_url,
    platform: videoAd.platform ?? "",
    audioLayout: "full_video",
    ...(videoAd.advertiserDetails ? { advertiserDetails: videoAd.advertiserDetails } : {}),
    ...(videoAd.contentVideo ? { contentVideo: videoAd.contentVideo } : {}),
  };
}

export function buildGenAdConfigFromAdTagObject(
  adTagObj: AdTagObjectType,
  videoId: string,
  brandId?: number
): GenAdConfig | undefined {
  const hasBanner = !!adTagObj.display_ad;
  const hasVideo = !!adTagObj.video_ad;
  const hasNative = !!adTagObj.native_ad;
  if (!hasBanner && !hasNative && !hasVideo) return undefined;

  const config: GenAdConfig = { adSlotId: `genad-slot-${videoId}` };

  if (brandId != null) {
    config.brandDetails = { brandId: String(brandId) };
  }

  if (adTagObj.display_ad) {
    config.banner = Array.isArray(adTagObj.display_ad)
      ? adTagObj.display_ad.map(mapBannerAdItem)
      : mapBannerAdItem(adTagObj.display_ad);
  }
  if (adTagObj.native_ad) {
    config.native = Array.isArray(adTagObj.native_ad)
      ? adTagObj.native_ad.map(mapNativeAdItem)
      : mapNativeAdItem(adTagObj.native_ad);
  }
  if (adTagObj.video_ad) {
    if (Array.isArray(adTagObj.video_ad)) {
      config.video = adTagObj.video_ad.map(mapVideoAdItem);
    } else {
      config.video = mapVideoAdItem(adTagObj.video_ad);
    }
  }

  if (adTagObj.order) {
    config.waterfallOrder = [];
    adTagObj.order.forEach((order) => {
      if (order === "video_ad") {
        config.waterfallOrder?.push("video");
      }

      if (order === "native_ad") {
        config.waterfallOrder?.push("native");
      }

      if (order === "display_ad") {
        config.waterfallOrder?.push("banner");
      }
    });
  }

  // disabling for usweekly for now since prebid is causing some issues with ad loading and we don't have a way to test it on staging
  // if (brandId === 2476) {
  //   config.prebid = {
  //     bidders: [
  //       { bidder: "pubmatic", params: { publisherId: "167328", adSlot: "7384620" } },
  //       { bidder: "magnite", params: { accountId: 27260, siteId: 619193, zoneId: 4013157 } },
  //     ],
  //     rollout: 1.0,
  //     prebidOptions: {
  //       prebidConfig: { debug: false },
  //     },
  //   };
  //   config.waterfallOrder = ["prebid", ...(config.waterfallOrder ?? [])];
  // }

  return config;
}
