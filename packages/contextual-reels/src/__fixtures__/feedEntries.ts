/**
 * Shared sample data for the three `FeedEntry` kinds (`ad`, `video-with-ad`,
 * `video`) — for unit tests that need a `NormalisedReel`/`NormalisedAd`/
 * `FeedEntry` without hand-rolling one. Generalized from the inline helpers
 * `ReelItem.test.tsx` used before this module existed.
 */
import type { FeedEntry, NormalisedAd, NormalisedReel } from "@cxr/types";

const BASE_REEL: NormalisedReel = {
  kind: "video",
  id: 0,
  active: true,
  videoUrl: null,
  videoType: null,
  thumb: null,
  user: null,
  community: null,
  cta: null,
  loop: null,
  ogDetails: null,
  owner: null,
  config: null,
  video: null,
};

const BASE_AD: NormalisedAd = {
  kind: "ad",
  id: 1,
  active: false,
  videoUrl: null,
  videoType: null,
  audioAds: false,
  videoAds: true,
  videoAd: "https://example.com/vast.xml",
  videoAdAdvertiserDetails: undefined,
  videoAdContentVideo: undefined,
  displayAd: undefined,
  nativeAd: undefined,
  videoPlatform: "gen_video",
  nativePlatform: undefined,
  displayPlatform: undefined,
  adUrl: "https://example.com/vast.xml",
  gateOnUnmute: false,
};

/** A `NormalisedReel` with `kind: "video"` and no `adObject`, unless overridden. */
export function makeNormalisedReel(overrides?: Partial<NormalisedReel>): NormalisedReel {
  return { ...BASE_REEL, ...overrides };
}

/** A `NormalisedAd` with sane defaults for a fillable video ad, unless overridden. */
export function makeNormalisedAd(overrides?: Partial<NormalisedAd>): NormalisedAd {
  return { ...BASE_AD, ...overrides };
}

/** Per-kind reel/ad overrides accepted by {@link makeFeedEntry}. */
export interface MakeFeedEntryOverrides {
  reel?: Partial<NormalisedReel>;
  ad?: Partial<NormalisedAd>;
}

/**
 * Build a `FeedEntry` of the given kind.
 *
 * - `"video"`: a plain organic reel, no ad break.
 * - `"video-with-ad"`: an organic reel with `adObject` guaranteed set.
 * - `"ad"`: a standalone ad slot.
 */
export function makeFeedEntry(
  kind: "ad" | "video-with-ad" | "video",
  overrides?: MakeFeedEntryOverrides
): FeedEntry {
  if (kind === "ad") {
    return { kind: "ad", data: makeNormalisedAd(overrides?.ad) };
  }
  if (kind === "video-with-ad") {
    const adObject = makeNormalisedAd(overrides?.ad);
    return {
      kind: "video-with-ad",
      data: { ...makeNormalisedReel(overrides?.reel), kind: "video-with-ad", adObject },
    };
  }
  return { kind: "video", data: makeNormalisedReel(overrides?.reel) };
}
