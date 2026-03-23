export type GenAdBannerConfig = {
  networkCode: string;
  adUnitPath: string;
  platform: string;
  size: [number, number];
};

export type GenAdAniviewConfig = {
  tagId: string;
  platform: string;
  publisherId: string;
};

export type GenAdNativeConfig = {
  networkCode: string;
  platform: string;
  adUnitPath: string;
};

export type GenAdVideoConfig = {
  vastUrl: string;
  audioLayout?: string;
  vpaidMode?: number;
  maxDuration?: number;
  width?: number;
  height?: number;
  platform: string;
};

export type GenAdConfig = {
  /** Unique element ID for the ad slot container div. */
  adSlotId: string;
  brandId?: string;
  banner?: GenAdBannerConfig;
  aniview?: GenAdAniviewConfig;
  native?: GenAdNativeConfig;
  video?: GenAdVideoConfig;
  waterfallOrder?: string[];
  debug?: boolean;
};

export type GenAdContainerProps = {
  /** Resolved GenAd configuration for this slot. */
  config: GenAdConfig;
  /** Whether this player is currently active/visible. Gates ad initialization. */
  isActive: boolean;
  /** Controls visibility — true when an ad is filling the slot. */
  isVisible: boolean;
  /** Video ID for analytics event payloads. */
  videoId?: string;
  /** Called when the waterfall finds an ad (provider name is passed). */
  onAdFilled?: (provider: string) => void;
  /** Called when all waterfall providers are exhausted (no ad to show). */
  onAdFillFailed?: () => void;
  /** Called when ad playback completes. */
  onAdCompleted?: () => void;
  /** Advances the feed to the next video after the ad ends. */
  moveToNextVideo: () => void;
};
