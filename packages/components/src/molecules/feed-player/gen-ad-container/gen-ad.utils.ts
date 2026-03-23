import type { AdTagObjectType } from "@genuin/components/react-query/api/feed/schema";
import type { GenAdConfig } from "./gen-ad.types";

export function extractNetworkCode(tagId: string): string {
  return tagId.split("/").filter(Boolean)[0] ?? "";
}

export function buildGenAdConfigFromAdTagObject(
  adTagObj: AdTagObjectType,
  videoId: string,
): GenAdConfig | undefined {
  const hasBanner = !!adTagObj.display_ad;
  const hasVideo = !!adTagObj.video_ad;
  const hasNative = !!adTagObj.native_ad;
  if (!hasBanner && !hasNative && !hasVideo) return undefined;

  const config: GenAdConfig = { adSlotId: `genad-slot-${videoId}` };

  if (adTagObj.display_ad) {
    config.banner = {
      networkCode: extractNetworkCode(adTagObj.display_ad.tag_id),
      adUnitPath: adTagObj.display_ad.tag_id,
      size: [300, 250],
      platform: adTagObj.display_ad.platform,
    };
  }
  if (adTagObj.native_ad) {
    config.native = {
      networkCode: extractNetworkCode(adTagObj.native_ad.tag_id),
      adUnitPath: adTagObj.native_ad.tag_id,
      platform: adTagObj.native_ad.platform,
    };
  }
  if (adTagObj.video_ad) {
    config.video = {
      vastUrl: adTagObj.video_ad.ads_url,
      platform: adTagObj.video_ad.platform,
    };
  }
  return config;
}
