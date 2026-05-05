import type { AdTagObjectType } from "@genuin/components/react-query/api/feed/schema";

import type { GenAdBannerConfig, GenAdConfig, GenAdNativeConfig, GenAdVideoConfig } from "./gen-ad.types";

export function extractNetworkCode(tagId: string): string {
  return tagId.split("/").filter(Boolean)[0] ?? "";
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

export function buildGenAdConfigFromAdTagObject(adTagObj: AdTagObjectType, videoId: string): GenAdConfig | undefined {
  const hasBanner = !!adTagObj.display_ad;
  const hasVideo = !!adTagObj.video_ad;
  const hasNative = !!adTagObj.native_ad;
  if (!hasBanner && !hasNative && !hasVideo) return undefined;

  const config: GenAdConfig = { adSlotId: `genad-slot-${videoId}` };

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

  return config;
}
