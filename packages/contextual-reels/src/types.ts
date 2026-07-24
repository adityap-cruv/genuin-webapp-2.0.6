/**
 * All domain types for the contextual-reels widget.
 *
 * Consolidates: types/api, types/feedItem.
 */

// ─── API response types ───────────────────────────────────────────────────────

/**
 * Shape returned by GET /goservices/ad_creative.
 *
 * Fields map directly to what `AdsPlaceholder.jsx` reads from `tagDetails`
 * and the ad-slot ad creative payload.
 */
export interface TagResponse {
  /** The tag identifier. */
  tag_id?: string;
  /** Whether the CTA button should be shown. */
  show_cta?: boolean;
  /**
   * CTA configuration used by BottomBar, TopBar, and OverlayGroup.
   *
   * Typed shape replaces the original `Record<string, unknown>` to allow
   * safe property access without casting in the overlay components.
   */
  cta?: {
    delay?: number;
    color?: string;
    text_color?: string;
    text?: string;
    /** Primary click-through URL. Some legacy payloads use `url` instead. */
    link?: string;
    /** Legacy alias for `link` seen in some API responses. */
    url?: string;
    ad_copy?: string;
  } | null;
  /** Customer/advertiser identifier (legacy string form). */
  customer_id?: string;
  /** Numeric brand identifier — used to initialise the Octo GenAI SDK. */
  brand_id?: number;
  /** Brand primary colour hex — used as compact-layout backdrop. */
  brand_color?: string;
  /**
   * Generic tag-level config blob.
   *
   * Typed shape exposes the fields the overlay components actually branch on.
   */
  config?: {
    show_owner_details?: boolean;
    show_spark?: boolean;
    show_share?: boolean;
    show_logo?: boolean;
    show_cta?: boolean;
    /** Control-layer UI variant ("default" | "iheart"). Defaults to "default" when absent. */
    variant?: "default" | "iheart";
    /** New Player design absent or any other value, keeps the legacy controls. Read via {@link useNewPlayerControls}.*/
    design_system?: "v1" | "v2";
    /** Redirect target for a tap on the widget. `"fullscreen"` enables ad expansion. */
    on_click?: "fullscreen" | string;
    /**
     * @deprecated No longer read — FullScreenProvider no longer hides or
     * redirects on fullscreen failure; it always falls back to manual
     * (in-page) fullscreen instead. Retained on the type for backward
     * compatibility with existing tag configs.
     */
    fullscreen_fallback_url?: string;
    /** When true, the owner block renders non-clickable (no profile navigation). */
    disable_profile_redirect?: boolean;
    /** When true, playback auto-advances to the next reel; false loops the current video. */
    auto_swipe?: boolean;
    /** Dashboard override for the GenAI Octo experience. Wins over the strategyConfig allowlist. */
    enable_ask_question?: boolean;
    [key: string]: unknown;
  } | null;
  /** Display (banner) ad descriptor. */
  display_ad?: unknown;
  /** Native ad descriptor. */
  native_ad?: unknown;
  /** VAST URL string or video ad object. */
  video_ad?: unknown;
  /** Advertiser branding details for the video ad. */
  video_ad_advertiser_details?: {
    logo: string;
    primaryColor: string;
  } | null;
  /** Companion content video to play behind the ad. */
  video_ad_content_video?: {
    url: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    objectFit: string;
  } | null;
  /** Ad click-through URL. */
  ad_url?: string | null;
}

/**
 * Per-reel ad configuration — one element of `reel.ad_configs.video_ad`.
 *
 * The backend attaches this to an organic (loop/reel) item to schedule a
 * fullscreen ad break. Only `ads_url` is guaranteed today; the optional fields
 * let the same shape carry richer creatives later without a type change.
 */
export interface AdsConfig {
  /** VAST/tag URL for the break creative. */
  ads_url?: string;
  /** Ad-network platform identifier (e.g. `'tritondigital'`, `'gen_video'`). */
  platform?: string;
  /** Advertiser branding for the ad overlay. */
  advertiserDetails?: { logo: string; primaryColor: string };
  /** Companion content video to play behind the ad. */
  contentVideo?: { url: string; autoplay: boolean; loop: boolean; muted: boolean; objectFit: string };
  /**
   * Whether the ad request must wait for the user to unmute before firing.
   * Omitted/`undefined` defaults to `true` (gate on unmute) — see {@link NormalisedAd.gateOnUnmute}.
   */
  gate_on_unmute?: boolean;
  /** Forward-compatible escape hatch for fields the backend adds later. */
  [key: string]: unknown;
}

/**
 * Shape of a single item in the raw feed returned by the backend.
 *
 * This is the *server response* shape. Downstream code maps it to `FeedItem`.
 */
export interface Reel {
  /** Numeric position index assigned by the feed pipeline. */
  id?: number;
  /** Whether this reel is currently active/playing. */
  active?: boolean;
  /** Discriminator — `'reel'` for organic content, `'ads'` for ad slots. */
  type?: string;
  /** HLS or MP4 playback URL. */
  video_url?: string;
  /** Codec/container hint (`'hls'` | `'mp4'` | …). */
  video_type?: string;
  /** Thumbnail image URL. */
  thumb?: string | null;
  /** Author/user object. */
  user?: Record<string, unknown> | null;
  /** Community the reel belongs to. */
  community?: Record<string, unknown> | null;
  /** CTA configuration. */
  cta?: Record<string, unknown> | null;
  /** Loop/playlist metadata. */
  loop?: Record<string, unknown> | null;
  /** Open Graph metadata. */
  og_details?: Record<string, unknown> | null;
  /** Owner organisation info. */
  owner?: Record<string, unknown> | null;
  /** Reel-level config blob. */
  config?: Record<string, unknown> | null;
  /** Video metadata returned alongside the reel. */
  video?: {
    id?: string;
    /** Legacy playback URL. Superseded by {@link media_url_m3u8}; read as a fallback. */
    url?: string;
    /** HLS playback URL (current QA feed field). Preferred over legacy {@link url}. */
    media_url_m3u8?: string;
    slug?: string;
    /** Legacy thumbnail URL. Superseded by {@link thumbnail_url}; read as a fallback. */
    thumbnail?: string;
    /** Thumbnail URL (current QA feed field). Preferred over legacy {@link thumbnail}. */
    thumbnail_url?: string;
    /** Legacy description (often a JSON-array string). Superseded by {@link description_text}. */
    description?: string;
    /** Plain-text description (current QA feed field). Preferred for the ticker. */
    description_text?: string;
    /** JSON-array-string description (current QA feed field). Fallback after {@link description_text}. */
    description_data?: string;
    share_string?: string;
    /**
     * Legacy per-reel ad-break config nested on the video object. Superseded by
     * the top-level {@link Reel.ad_configs}; read as a fallback so older feed
     * responses (single `ads_config` object) still schedule an ad break.
     */
    ads_config?: AdsConfig | null;
    [key: string]: unknown;
  } | null;
  /** Ad configurations for this reel item — `video_ad[0]` drives the fullscreen ad break. */
  ad_configs?: {
    video_ad?: AdsConfig[];
  } | null;
  // Ad-specific fields (present when type === 'ads')
  audioAds?: boolean;
  videoAds?: boolean;
  video_ad?: unknown;
  video_ad_advertiser_details?: { logo: string; primaryColor: string } | null;
  video_ad_content_video?: {
    url: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    objectFit: string;
  } | null;
  video_ad_platform?: string;
  native_ad_platform?: string;
  display_ad_platform?: string;
  display_ad?: unknown;
  native_ad?: unknown;
  ad_url?: string | null;
  /** Audio ad descriptor (present when type === 'ads' and audio_ad slot is filled). */
  audio_ad?: unknown;
  /**
   * Whether this standalone ad slot must wait for the user to unmute before
   * firing. Omitted/`undefined` defaults to `false` (load regardless of mute)
   * — see {@link NormalisedAd.gateOnUnmute}.
   */
  gate_on_unmute?: boolean;
}

/**
 * Shape of the feed endpoint response.
 */
export interface FeedResponse {
  /** Ordered list of feed items (reels + injected ad slots). */
  reels: Reel[];
  /**
   * Opaque pagination cursor returned by the server.
   * Pass back on the next fetch to retrieve the next page.
   */
  ref: string;
}

/**
 * Raw geoip fields returned by the IP-info service.
 *
 * All fields are optional — different geoip providers return different subsets.
 * Consumers normalise via `enrichDeviceDetailsWithGeoIp`.
 */
export interface IpInfo {
  /** IPv4/IPv6 address (some providers). */
  ip?: string;
  /** IPv4/IPv6 address (ip-api.com). */
  query?: string;
  /** IPv4/IPv6 address (tip field variant). */
  tip?: string;
  city?: string;
  city_en?: string;
  country?: string;
  country_code?: string;
  country_name?: string;
  country_en?: string;
  latitude?: number | string;
  lat?: number | string;
  longitude?: number | string;
  lon?: number | string;
  lng?: number | string;
  /** Comma-separated `'lat,lng'` string (some providers). */
  location?: string;
}

// ─── Feed item types ──────────────────────────────────────────────────────────

/** Discriminator string for feed items. */
export type FeedItemType = "reel" | "ads";

/** Normalised user/author shape produced by the feed transform pipeline. */
export interface FeedItemUser {
  /** Profile image URL rewritten to the small-dimensions variant. */
  thumb: string | null;
  /** Display name / nickname. */
  name: string | undefined;
  /** CTA click-through URL. */
  ctaLink: string | undefined;
  /** CTA button label text. */
  ctaCaption: string | undefined;
  /** CTA button colour (hex). */
  ctaColor: string;
}

/**
 * Fields shared by all feed items regardless of type.
 * @deprecated Use {@link FeedEntry} and its narrowed types instead.
 */
export interface BaseFeedItem {
  /** Numeric position index, reassigned by the injection pass. */
  id: number;
  /** Whether this slot is currently active/playing. */
  active: boolean;
  /** Discriminates reel vs ad slot. */
  type: FeedItemType;
  /** Playback URL (HLS or MP4). */
  video_url?: string | null;
  /** Codec/container hint. */
  video_type?: string | null;
  /** Thumbnail URL. */
  thumb?: string | null;
  /** Author/user object normalised by the transform pipeline. */
  user?: FeedItemUser | null;
  /** Community the item belongs to. */
  community?: Record<string, unknown> | null;
  /**
   * CTA configuration at the item level.
   *
   * When present, item-level values override the `TagResponse.cta` defaults.
   */
  cta?: {
    link?: string;
    text?: string;
    ad_copy?: string;
    show_url_meta?: boolean;
  } | null;
  /**
   * Loop/playlist metadata.
   *
   * Typed for the fields used by RightBar deep-link params.
   */
  loop?: {
    share_string?: string;
    preview_image?: string;
    [key: string]: unknown;
  } | null;
  /**
   * Open Graph metadata for the CTA link preview.
   *
   * Null when `playerType === 'pip'`.
   */
  og_details?: {
    og_image?: string;
    og_title?: string;
    [key: string]: unknown;
  } | null;
  /**
   * Owner organisation info.
   *
   * Typed for fields used by OverlayGroup's profile link and avatar.
   */
  owner?: {
    share_string?: string;
    nickname?: string;
    profile_image?: string;
    [key: string]: unknown;
  } | null;
  /** Item-level config blob. */
  config?: Record<string, unknown> | null;
  /** Player type — `'pip'` suppresses OG image display. */
  playerType?: string;
  // Ad-related fields present on BaseFeedItem for cross-type compatibility
  /** Ad click-through URL. */
  ad_url?: string;
  /** Ad network platform identifier for video ads. */
  video_ad_platform?: string;
  /** Display/banner ad descriptor. */
  display_ad?: unknown;
  /** Native ad descriptor. */
  native_ad?: unknown;
  /** VAST URL string or video ad descriptor object. */
  video_ad?: unknown;
  /** Advertiser branding for the video ad overlay. */
  video_ad_advertiser_details?: { logo?: string; primaryColor?: string };
  /** Companion content video that plays behind the ad. */
  video_ad_content_video?: unknown;
  /** Ad network platform identifier for native ads. */
  native_ad_platform?: string;
  /** Ad network platform identifier for display/banner ads. */
  display_ad_platform?: string;
  /** Whether this slot plays audio-only ads. */
  audioAds?: boolean;
  /** Whether this slot plays video ads. */
  videoAds?: boolean;
}

/**
 * A standard organic reel feed item.
 * @deprecated Use {@link NormalisedReel} via {@link FeedEntry} instead.
 */
export interface ReelFeedItem extends BaseFeedItem {
  readonly type: "reel";
  /** Video metadata. */
  video?: {
    id?: string;
    url?: string;
    slug?: string;
    thumbnail?: string;
    description?: string;
  } | null;
}

/**
 * An ad slot feed item.
 *
 * Contains all the ad-creative fields that `AdsPlaceholder` consumes.
 * @deprecated Use {@link NormalisedAd} via {@link FeedEntry} instead.
 */
export interface AdFeedItem extends BaseFeedItem {
  readonly type: "ads";
  /** Whether this slot plays audio-only ads. */
  audioAds?: boolean;
  /** Whether this slot plays video ads. */
  videoAds?: boolean;
  /** VAST URL string or video ad descriptor object. */
  video_ad?: unknown;
  /** Advertiser branding for the video ad overlay. */
  video_ad_advertiser_details?: { logo: string; primaryColor: string };
  /** Companion content video that plays behind the ad. */
  video_ad_content_video?: {
    url: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    objectFit: string;
  } | null;
  /** Ad network platform identifier for video ads. */
  video_ad_platform?: string;
  /** Ad network platform identifier for native ads. */
  native_ad_platform?: string;
  /** Ad network platform identifier for display/banner ads. */
  display_ad_platform?: string;
  /** Display/banner ad descriptor. */
  display_ad?: unknown;
  /** Native ad descriptor. */
  native_ad?: unknown;
  /** Ad click-through URL. */
  ad_url?: string;
  /** Video metadata (used for static ad items). */
  video?: {
    id?: string;
    url?: string;
    slug?: string;
    thumbnail?: string;
    description?: string;
  } | null;
}

/**
 * Discriminated union of all feed item types.
 *
 * Narrow via `item.type === 'ads'` to access ad-specific fields.
 * @deprecated Use {@link FeedEntry} instead.
 */
export type FeedItem = ReelFeedItem | AdFeedItem;

// ─── Normalised feed entry types (Phase 2 pipeline) ──────────────────────────

/** Organic video content after normalisation. */
export interface NormalisedReel {
  readonly kind: "video" | "video-with-ad";
  id: number;
  active: boolean;
  videoUrl: string | null;
  videoType: string | null;
  thumb: string | null;
  user: FeedItemUser | null;
  community: Record<string, unknown> | null;
  cta: { link?: string; text?: string; ad_copy?: string; show_url_meta?: boolean } | null;
  loop: { share_string?: string; preview_image?: string; [key: string]: unknown } | null;
  ogDetails: { og_image?: string; og_title?: string; [key: string]: unknown } | null;
  owner: { share_string?: string; nickname?: string; profile_image?: string; [key: string]: unknown } | null;
  config: Record<string, unknown> | null;
  playerType?: string;
  video: {
    id?: string;
    url?: string;
    slug?: string;
    thumbnail?: string;
    description?: string;
    share_string?: string;
  } | null;
  /** Fullscreen ad-break config — backend-provided eventually, mock-injected now. */
  adObject?: NormalisedAd;
}

/** Ad-slot data sufficient to initialise GenAd SDK for an API-sourced ad reel. */
export interface NormalisedAd {
  readonly kind: "ad";
  id: number;
  active: boolean;
  /** BLANK_HLS_URL when videoAds=true, null otherwise. Needed by LightPlayer. */
  videoUrl: string | null;
  videoType: string | null;
  audioAds: boolean;
  videoAds: boolean;
  videoAd: unknown;
  videoAdAdvertiserDetails: { logo: string; primaryColor: string } | undefined;
  videoAdContentVideo: { url: string; autoplay: boolean; loop: boolean; muted: boolean; objectFit: string } | undefined;
  displayAd: unknown;
  nativeAd: unknown;
  videoPlatform: string | undefined;
  nativePlatform: string | undefined;
  displayPlatform: string | undefined;
  adUrl: string | undefined;
  /**
   * Whether `useGenAdInstance` must wait for the user to unmute before
   * requesting this ad. `true` gates the request on the unmuted state (used
   * for ad breaks on organic videos); `false` requests immediately regardless
   * of mute state (used for standalone `type:"ads"` slides). Sourced from the
   * backend's `gate_on_unmute` flag when present, else the producer's default.
   */
  gateOnUnmute: boolean;
}

/**
 * Discriminated union output of the transformation layer.
 *
 * Narrow via `entry.kind` to access the specific normalised data shape:
 * - `"video"`         — organic reel, no ad break
 * - `"video-with-ad"` — organic reel with `adObject` guaranteed non-null
 * - `"ad"`            — standalone ad slot
 */
export type FeedEntry =
  | { kind: "video"; data: NormalisedReel }
  | { kind: "video-with-ad"; data: NormalisedReel }
  | { kind: "ad"; data: NormalisedAd };
