/**
 * Feed transform pipeline for the contextual-reels widget.
 *
 * Consolidates: utils/thumbnails, feed/transforms/transformReelData.
 */
import type {
  Reel,
  TagResponse,
  FeedItem,
  FeedItemType,
  FeedItemUser,
  NormalisedReel,
  NormalisedAd,
  FeedEntry,
  AdsConfig,
} from "@cxr/types";
import { createLogger } from "@cxr/utils/logger";

// ─── Thumbnail URL helpers ────────────────────────────────────────────────────

const thumbLogger = createLogger("cxr/thumbnails");

/**
 * Rewrites a thumbnail URL so it points to the smaller `/s/` variant.
 *
 * Splits on `/thumbnails/` and inserts `/s/` between the base URL and the
 * thumbnail path. Returns the original value unchanged when the URL is
 * invalid, falsy, or does not contain `/thumbnails/`.
 *
 * @param thumbUrl - The original thumbnail URL.
 */
export function replaceThumbnailUrlForSmallDimensions(thumbUrl: string): string {
  if (!thumbUrl || typeof thumbUrl !== "string") {
    thumbLogger.error("Invalid or undefined thumbnail URL");
    return thumbUrl;
  }
  const parts = thumbUrl.split("/thumbnails/");
  if (parts.length !== 2) {
    // Not an error: CDN thumbnails (e.g. bunny-CDN `.../thumbnail.jpg`) have no
    // `/thumbnails/` segment and no `/s/` variant, so we use the URL as-is.
    thumbLogger.debug("No /thumbnails/ segment; using thumbnail URL unchanged");
    return thumbUrl;
  }
  const [baseUrl, thumbnailPath] = parts as [string, string];
  return `${baseUrl}/thumbnails/s/${thumbnailPath}`;
}

/**
 * Rewrites a profile-image URL so it points to the smaller `/s/` variant.
 *
 * @param profileImageUrl - The original profile image URL.
 */
export function replaceProfileImageUrlForSmallDimensions(profileImageUrl: string): string {
  if (!profileImageUrl || typeof profileImageUrl !== "string") {
    thumbLogger.error("Invalid or undefined thumbnail URL");
    return profileImageUrl;
  }
  const parts = profileImageUrl.split("/profile_images/");
  if (parts.length !== 2) {
    // Not an error: some profile images have no `/profile_images/` segment and
    // thus no `/s/` variant, so we use the URL as-is.
    thumbLogger.debug("No /profile_images/ segment; using profile image URL unchanged");
    return profileImageUrl;
  }
  const [baseUrl, imagePath] = parts as [string, string];
  return `${baseUrl}/profile_images/s/${imagePath}`;
}

/**
 * Normalises a video description that may arrive as a JSON-stringified array
 * (e.g. `'["some text"]'`) instead of a plain string. Returns the first
 * element's text when the input parses to a non-empty array, otherwise
 * returns the input unchanged.
 *
 * @param description - The raw description value from the feed payload.
 */
export function normaliseDescription(description: string | undefined): string | undefined {
  if (!description || typeof description !== "string") return description;
  const trimmed = description.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return description;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed[0];
    }
    return description;
  } catch {
    return description;
  }
}

/**
 * Normalises a reel's `video` object, fixing up `description` (see
 * {@link normaliseDescription}). Returns `null` when `video` is absent.
 *
 * @param video - The raw video object from the feed payload.
 */
export function normaliseVideo(video: NormalisedReel["video"]): NormalisedReel["video"] {
  if (!video) return null;
  // The QA feed renamed the description fields: `description_text` (plain string)
  // and `description_data` (JSON-array string, like the legacy `description`).
  // Prefer the clean text, then the array form, then legacy — so every feed
  // shape still feeds the ticker. normaliseDescription unwraps the array form
  // and is a no-op for an already-plain string.
  const raw = video as { description_text?: string; description_data?: string; description?: string };
  const rawDescription = raw.description_text ?? raw.description_data ?? raw.description;
  return { ...video, description: normaliseDescription(rawDescription) };
}

/**
 * A blank HLS stream used as the `video_url` for in-feed ad entries.
 *
 * This keeps the HLS player in a valid (but silent) state while the GenAd
 * SDK renders the actual ad content over it.
 */
export const BLANK_HLS_URL = "https://reels-media.s3.us-east-2.amazonaws.com/static/blank_screen/300h/master.m3u8";

// ─── Fullscreen ad break (organic videos) ─────────────────────────────────────
// TODO(cxr): replace the static config once the feed API returns adObject per reel.

// Offset keeps ad-break slot DOM ids from colliding with in-feed ad entry ids.
const REEL_AD_BREAK_ID_OFFSET = 100_000;

const REEL_AD_BREAK_TRITON_URL =
  "https://cmod-na.live.streamtheworld.com/ondemand/ars?site-url=[PAGE_URL]&ip=122.170.151.237&ua=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36&ttag=brand_id:99&stid=1443132&type=midroll&delivery-method=download";

const REEL_AD_BREAK_INFY_URL =
  "https://nxs.begenuin.com/tagxml/customer/3119/tag/3753?&location_lat=[LOCATION_LAT]&city=[CITY]&regionfips104_dg=[DEVICE_GEO_REGIONFIPS104]&source_ds=[DEVICE_SUA_SOURCE]&AV_CONTENT_ID=&midroll_times=&session_id=[SESSION_ID]&utcoffset_ug=[USER_GEO_UTCOFFSET]&AV_DNT=[DNT]&site_page=[PAGE_URL]&device_ipv6=[DEVICE_IPV6]&AV_PLCMT=[PLACEMENT_MACRO]&AV_LATITUDE=[LOCATION_LAT]&AV_GDPR=[GDPR]&cat_s=[SITE_CAT]&domain_sp=begenuin.com&postroll=1&skipafter_iv=0&site_search=[SITE_SEARCH]&keywords_s=[SITE_KEYWORDS]&ppi_d=[DEVICE_PPI]&lon_ug=[USER_GEO_LON]&plcmt_iv=1&accuracy_dg=[DEVICE_ACCURACY]&bitness_ds=[DEVICE_SUA_BITNESS]&max_ad_duration=60&location_lon=[LOCATION_LON]&us_privacy_r=1---&AV_LANGUAGE=[DEVICE_LANGUAGE]&AV_DOMAIN=[DOMAIN]&placement_iv=1&linearity_iv=1&device_js=[DEVICE_JS]&metro_ug=[USER_GEO_METRO]&lastfix_ug=[USER_GEO_LASTFIX]&cattax_sp=[SITE_PUBLISHER_CATTAX]&device_make=[DEVICE_MAKE]&AV_LMT=[LIMITED_AD_TRACKING]&pub_name=[PUBLISHER_NAME]&player_width=[WIDTH]&pos_iv=7&langb_d=[DEVICE_LANGB]&user_id=3F27Nx17QetY0IFxF8edNKyEijL&AV_REGION=[REGION]&AV_MODEL=[DEVICE_MODEL]&secure_i=1&ad_breaks=0,0,-1&flashver_d=[DEVICE_FLASHVER]&mobile_ds=[DEVICE_SUA_MOBILE]&platform_version_ds=[DEVICE_SUA_PLATFORM_VERSION]&url_sc=[CONTENT_URL]&player_height=[HEIGHT]&lat_ug=[USER_GEO_LAT]&AV_OSVERS=[OS_VERSION]&device_type=[DEVICE_TYPE]&ua=[UA]&AV_CONSENT=[GDPRCONSENT]&mccmnc_d=[DEVICE_MCCMNC]&AV_USERAGENT=[UA]&name_s=Begenuin&privacypolicy_s=[SITE_PRIVACYPOLICY]&bidfloorcur_i=USD&accuracy_ug=[USER_GEO_ACCURACY]&lastfix_dg=[DEVICE_GEO_LASTFIX]&yob=[YOB]&device_language=[DEVICE_LANGUAGE]&ipservice_ug=[USER_GEO_IPSERVICE]&site_ref=[SITE_REF]&cattax_s=[SITE_CATTAX]&device_model=[DEVICE_MODEL]&geofetch_d=[DEVICE_GEOFETCH]&ipservice_dg=[DEVICE_GEO_IPSERVICE]&metro_dg=[DEVICE_GEO_METRO]&region_ug=[USER_GEO_REGION]&len_sc=[CONTENT_LENGTH]&sectioncat_s=[SITE_SECTIONCAT]&id_sp=99&mobile_s=[SITE_MOBILE]&min_ad_duration=5&region=[REGION]&connectiontype_d=[DEVICE_CONNECTIONTYPE]&browsers_version_ds=[DEVICE_SUA_BROWSERS_VERSION]&city_ug=[USER_GEO_CITY]&site_id=99_&width=[DEVICE_WIDTH]&AV_LONGITUDE=[LOCATION_LON]&AV_RTB_DEVICE_TYPE=[DEVICE_TYPE]&hwv=[DEVICE_HWV]&kwarray_s=[SITE_KWARRAY]&pxratio_d=[DEVICE_PXRATIO]&type_dg=[DEVICE_GEO_TYPE]&AV_OS=[OS]&AV_URL=[PAGE_URL]&is_lat=[LIMITED_AD_TRACKING]&AV_MAKE=[DEVICE_MAKE]&AV_IFA_TYPE=[IFA_TYPE]&height=[DEVICE_HEIGHT]&zip=[ZIP_CODE]&platform_brand_ds=[DEVICE_SUA_PLATFORM_BRAND]&type_ug=[USER_GEO_TYPE]&country_ug=[USER_GEO_COUNTRY]&AV_HEIGHT=[DEVICE_HEIGHT]&cb=1781261273335247142&did=[DID]&AV_CONNECTIONTYPE=[DEVICE_CONNECTIONTYPE]&AV_TIMESTAMP=1781261273335247482&utcoffset_dg=[DEVICE_GEO_UTCOFFSET]&dnt=[DNT]&name_sp=[SITE_PUBLISHER_NAME]&cat_sp=[SITE_PUBLISHER_CAT]&os=[DEVICE_OS]&gender=[GENDER]&carrier_d=[DEVICE_CARRIER]&zip_ug=[USER_GEO_ZIP]&us_privacy=1---&AV_WIDTH=[DEVICE_WIDTH]&AV_PLACEMENT=[VIDEO_PLACEMENT]&AV_IP=[IP]&vid_d=0&domain_s=[DOMAIN]&ip=[IP]&browsers_brand_ds=[DEVICE_SUA_BROWSERS_BRAND]&model_ds=[DEVICE_SUA_MODEL]&country_code=[COUNTRY_ID]&architecture_ds=[DEVICE_SUA_ARCHITECTURE]&regionfips104_ug=[USER_GEO_REGIONFIPS104]&pagecat_s=[SITE_PAGECAT]&skipmin_iv=0&osv=[DEVICE_OS_VERSION]";

/** Live ad waterfall for the fullscreen ad break — Triton first, Infy fallback. */
const REEL_AD_BREAK_VIDEO_AD = [
  { ads_url: REEL_AD_BREAK_TRITON_URL, cpm: 5, platform: "tritondigital", url: REEL_AD_BREAK_TRITON_URL },
  { ads_url: REEL_AD_BREAK_INFY_URL, cpm: 5, platform: "infy", url: REEL_AD_BREAK_INFY_URL },
];

/**
 * Build the fullscreen ad-break config for an organic reel from the live ad
 * waterfall above. Stands in for the backend `adObject`.
 *
 * @param reelId        The reel's feed position — offset to keep slot ids unique.
 * @param gateOnUnmute  Tag-level default; forwarded when the backend omits `gate_on_unmute`.
 */
export function buildReelAdObject(reelId: number, gateOnUnmute: boolean): NormalisedAd {
  return buildAdObject({
    id: REEL_AD_BREAK_ID_OFFSET + reelId,
    active: false,
    audioAds: false,
    videoAds: true,
    // Fresh copy per reel so SDK-side mutation can't leak across slots.
    videoAd: REEL_AD_BREAK_VIDEO_AD.map((entry) => ({ ...entry })),
    videoPlatform: REEL_AD_BREAK_VIDEO_AD[0]!.platform,
    adUrl: REEL_AD_BREAK_VIDEO_AD[0]!.url,
    gateOnUnmute,
  });
}

// ─── Reel data transform ──────────────────────────────────────────────────────

// generateAdLink was in legacy utility.js; inlined here to eliminate the dependency.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateAdLink(_opts: {
  isSSAI: boolean;
  tagDetails: { tag_id?: string; customer_id?: string };
  end_roll: boolean;
}): string {
  return "https://programmatic-dsp.infytvcode.repl.co/vast";
}

/** Helper: returns true when value is an object with at least one key. */
function hasObjectContent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value !== "object") return false;
  return Object.keys(value as object).length > 0;
}

/** Helper: returns true when value is a non-empty array or a non-empty object. */
function hasAdContent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return hasObjectContent(value);
}

/**
 * Transform a raw API Reel into the FeedItem shape expected by the feed renderer.
 *
 * @deprecated Use {@link normaliseReel} / {@link normaliseAd} via {@link normaliseFeed} instead.
 * @param reel               Raw reel from the feed API.
 * @param index              Zero-based position in the feed; becomes `id`.
 * @param tagDetails         Tag configuration, used for VAST ad-link generation.
 * @param isAudioAdsElement  True when the embed layout is an audio-ads layout.
 */
export function transformReelData(
  reel: Reel,
  index: number,
  tagDetails: TagResponse,
  isAudioAdsElement: boolean
): FeedItem {
  const isAdsType = reel.type === "ads";
  const isVastType = reel.video_type === "vast";

  const hasVideoAd = isAdsType && hasAdContent(reel.video_ad);
  const isAudioAds = isAdsType && hasAdContent(reel.audio_ad) && isAudioAdsElement;

  const firstVideoAd = Array.isArray(reel.video_ad)
    ? (reel.video_ad as Record<string, unknown>[])[0]
    : (reel.video_ad as Record<string, unknown> | undefined);

  // --- video_url ---
  let video_url: string | null | undefined;
  if (isAdsType) {
    video_url = hasVideoAd ? BLANK_HLS_URL : null;
  } else if (isVastType) {
    video_url = BLANK_HLS_URL;
  } else {
    video_url = (reel.video as { url?: string } | null | undefined)?.url;
  }

  // --- ad_url ---
  let ad_url: string | undefined;
  if (hasVideoAd || isAudioAds) {
    if (Array.isArray(reel.video_ad)) {
      ad_url = (firstVideoAd?.["url"] as string | undefined) ?? (firstVideoAd?.["ads_url"] as string | undefined);
    } else {
      ad_url =
        ((reel.video_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined) ??
        ((reel.audio_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined);
    }
  } else if (isVastType && !isAdsType) {
    ad_url = generateAdLink({
      isSSAI: false,
      tagDetails: { tag_id: tagDetails.tag_id, customer_id: tagDetails.customer_id },
      end_roll: false,
    }) as string | undefined;
  }

  // --- video_ad ---
  let video_ad: unknown;
  if (isAdsType) {
    if (Array.isArray(reel.video_ad)) {
      video_ad = reel.video_ad;
    } else {
      video_ad =
        ((reel.video_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined) ??
        ((reel.audio_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined);
    }
  }

  const advertiserLogo = firstVideoAd?.["advertiserDetails"] as { logo?: string; primaryColor?: string } | undefined;
  const video_ad_advertiser_details =
    isAdsType && hasVideoAd && (advertiserLogo?.logo || advertiserLogo?.primaryColor)
      ? {
          logo: advertiserLogo.logo as string,
          primaryColor: advertiserLogo.primaryColor as string,
        }
      : undefined;

  const video_ad_content_video =
    isAdsType && hasVideoAd
      ? (firstVideoAd?.["contentVideo"] as
          | { url: string; autoplay: boolean; loop: boolean; muted: boolean; objectFit: string }
          | undefined)
      : undefined;

  let video_ad_platform: string | undefined;
  if (hasVideoAd) {
    video_ad_platform = firstVideoAd?.["platform"] as string | undefined;
  } else if (isVastType && !isAdsType) {
    video_ad_platform = "gen_video";
  } else {
    video_ad_platform = (reel.video as { platform?: string } | null | undefined)?.platform;
  }

  const native_ad_platform = isAdsType
    ? ((reel.native_ad as Record<string, unknown> | undefined)?.["platform"] as string | undefined)
    : undefined;
  const display_ad_platform = isAdsType
    ? ((reel.display_ad as Record<string, unknown> | undefined)?.["platform"] as string | undefined)
    : undefined;

  const thumb = replaceThumbnailUrlForSmallDimensions(
    (reel.video as { thumbnail?: string } | null | undefined)?.thumbnail ?? ""
  ) as string | undefined;

  const userThumb = replaceProfileImageUrlForSmallDimensions(
    (reel.owner as { profile_image?: string } | null | undefined)?.profile_image ?? ""
  ) as string | undefined;

  const type: FeedItemType = isAdsType ? "ads" : "reel";
  const video_type = isVastType || hasVideoAd ? "hls" : undefined;

  const user: FeedItemUser = {
    thumb: userThumb || null,
    name: (reel.owner as { nickname?: string } | null | undefined)?.nickname,
    ctaLink: (reel.cta as { link?: string } | null | undefined)?.link,
    ctaCaption: (reel.cta as { text?: string } | null | undefined)?.text,
    ctaColor: "#0645ff",
  };

  return {
    video: reel.video as { id?: string; url?: string } | null | undefined,
    id: index,
    active: index === 0,
    type,
    audioAds: isAudioAds,
    videoAds: hasVideoAd,
    video_url,
    ad_url,
    community: reel.community ?? null,
    cta: (reel.cta as { link?: string; text?: string; ad_copy?: string; show_url_meta?: boolean } | null) ?? null,
    loop: (reel.loop as { share_string?: string; preview_image?: string; [key: string]: unknown } | null) ?? null,
    og_details: (reel.og_details as { og_image?: string; og_title?: string; [key: string]: unknown } | null) ?? null,
    owner:
      (reel.owner as {
        share_string?: string;
        nickname?: string;
        profile_image?: string;
        [key: string]: unknown;
      } | null) ?? null,
    config: reel.config ?? null,
    display_ad: isAdsType ? reel.display_ad : undefined,
    native_ad: isAdsType ? reel.native_ad : undefined,
    video_ad,
    video_ad_advertiser_details,
    video_ad_content_video,
    video_ad_platform,
    native_ad_platform,
    display_ad_platform,
    thumb: thumb || null,
    user,
    video_type,
  } as FeedItem;
}

// ─── Phase 2: normalised entry pipeline ──────────────────────────────────────

/**
 * Already-resolved ad fields, agnostic to where they came from (a `type:"ads"`
 * reel, a per-reel `video.ads_config`, or the static demo catalog).
 *
 * Each producer extracts these from its own raw shape; {@link buildAdObject}
 * is the single place that assembles them into a {@link NormalisedAd}. Add a
 * new ad source by writing one small extractor that returns this shape — the
 * rendering side never has to change.
 */
export interface AdSource {
  id: number;
  active?: boolean;
  audioAds?: boolean;
  videoAds?: boolean;
  videoAd?: unknown;
  videoAdAdvertiserDetails?: { logo: string; primaryColor: string } | undefined;
  videoAdContentVideo?:
    | { url: string; autoplay: boolean; loop: boolean; muted: boolean; objectFit: string }
    | undefined;
  displayAd?: unknown;
  nativeAd?: unknown;
  videoPlatform?: string;
  nativePlatform?: string;
  displayPlatform?: string;
  adUrl?: string;
  /** See {@link NormalisedAd.gateOnUnmute}. Defaults to `true` when omitted. */
  gateOnUnmute?: boolean;
}

/**
 * Assemble a {@link NormalisedAd} from already-extracted {@link AdSource}
 * fields. `videoUrl`/`videoType` are derived from `videoAds` — a video ad needs
 * the blank HLS stream behind it; an audio/display/native ad does not.
 *
 * @param source  Resolved ad fields from any producer.
 */
export function buildAdObject(source: AdSource): NormalisedAd {
  const videoAds = source.videoAds ?? false;
  return {
    kind: "ad",
    id: source.id,
    active: source.active ?? false,
    videoUrl: videoAds ? BLANK_HLS_URL : null,
    videoType: videoAds ? "hls" : null,
    audioAds: source.audioAds ?? false,
    videoAds,
    videoAd: source.videoAd,
    videoAdAdvertiserDetails: source.videoAdAdvertiserDetails,
    videoAdContentVideo: source.videoAdContentVideo,
    displayAd: source.displayAd,
    nativeAd: source.nativeAd,
    videoPlatform: source.videoPlatform,
    nativePlatform: source.nativePlatform,
    displayPlatform: source.displayPlatform,
    adUrl: source.adUrl,
    gateOnUnmute: source.gateOnUnmute ?? true,
  };
}

/**
 * Best-effort ad platform from a VAST/tag URL when `ads_config` omits an
 * explicit `platform`. Grounded in the live ad-break waterfall hosts
 * ({@link REEL_AD_BREAK_VIDEO_AD}); an explicit `ads_config.platform` always
 * wins over this. Returns `undefined` for unknown hosts so the SDK falls back
 * to its own provider resolution.
 *
 * @param adsUrl  The `ads_url` from `ads_config`.
 */
export function inferVideoAdPlatform(adsUrl: string | undefined): string | undefined {
  if (!adsUrl) return undefined;
  if (adsUrl.includes("streamtheworld.com")) return "tritondigital";
  if (adsUrl.includes("nxs.begenuin.com")) return "infy";
  return undefined;
}

/**
 * Map a backend `ad_configs.video_ad[0]` entry into the ad-break {@link NormalisedAd}.
 *
 * This is the real-data counterpart to the mock {@link buildReelAdObject}: the
 * organic video plays first, then this ad renders as the fullscreen break.
 *
 * @param adsConfig     The first element of `reel.ad_configs.video_ad`.
 * @param id            Slot id — offset by the caller to stay unique vs in-feed ads.
 * @param gateOnUnmute  Tag-level default applied when the backend `ads_config`
 *                      omits an explicit `gate_on_unmute`.
 */
export function buildReelAdObjectFromConfig(
  adsConfig: AdsConfig,
  id: number,
  gateOnUnmute: boolean
): NormalisedAd {
  return buildAdObject({
    id,
    active: false,
    audioAds: false,
    videoAds: true,
    // String VAST url; normalizeVideoConfig wraps it and applies videoPlatform.
    videoAd: adsConfig.ads_url,
    videoPlatform: adsConfig.platform ?? inferVideoAdPlatform(adsConfig.ads_url),
    videoAdAdvertiserDetails: adsConfig.advertiserDetails,
    videoAdContentVideo: adsConfig.contentVideo,
    adUrl: adsConfig.ads_url,
    // Backend value wins; fall back to the tag-level strategy default.
    gateOnUnmute: adsConfig.gate_on_unmute ?? gateOnUnmute,
  });
}

/**
 * Resolve the ad-break config for an organic reel across both backend shapes,
 * newest-wins:
 *   1. `reel.ad_configs.video_ad[0]` — current top-level array shape.
 *   2. `reel.video.ads_config`       — legacy single object nested on `video`.
 *
 * Returns the first entry carrying an `ads_url`, or `undefined` when neither
 * shape supplies one. Keeping the lookup here means {@link normaliseReel} stays
 * agnostic to which shape the backend sent.
 *
 * @param reel  Raw reel from the feed API.
 */
export function resolveReelAdConfig(reel: Reel): AdsConfig | undefined {
  const current = reel.ad_configs?.video_ad?.[0];
  if (current?.ads_url) return current;
  const legacy = (reel.video as { ads_config?: AdsConfig | null } | null)?.ads_config;
  if (legacy?.ads_url) return legacy;
  return undefined;
}

/**
 * Normalise a raw organic reel into a NormalisedReel entry.
 *
 * @param reel          Raw reel from feed API.
 * @param index         Zero-based position; becomes id.
 * @param tagId         Tag id; gates the mock fullscreen ad-break `adObject`.
 * @param adBreakEnabled  Whether mock ad-break fallback is active for this tag.
 * @param gateOnUnmute  Tag-level default for `NormalisedAd.gateOnUnmute` when the
 *                      backend does not supply an explicit value.
 * @param adsDisabled   Hard kill switch — when true, no ad break is attached even
 *                      if the backend supplies one; the reel stays a plain `video`.
 */
export function normaliseReel(
  reel: Reel,
  index: number,
  tagId: string,
  adBreakEnabled: boolean,
  gateOnUnmute: boolean,
  adsDisabled: boolean
): { kind: "video" | "video-with-ad"; data: NormalisedReel } {
  const isVastType = reel.video_type === "vast";
  // isAdsType check needed to distinguish vast-organic from ads-type reels
  const isAdsType = reel.type === "ads";

  // The QA feed renamed the playback and thumbnail fields (`media_url_m3u8`,
  // `thumbnail_url`). Read the new names first, falling back to the legacy
  // `url`/`thumbnail` so a backend that has only rolled the rename out to some
  // environments (e.g. QA ahead of prod) keeps serving playable content.
  const rawVideo = reel.video as
    | { url?: string; media_url_m3u8?: string; thumbnail?: string; thumbnail_url?: string }
    | null;

  const videoUrl: string | null = isVastType
    ? BLANK_HLS_URL
    : (rawVideo?.media_url_m3u8 ?? rawVideo?.url ?? null);

  const videoType: string | null =
    isVastType || (reel.video_type != null && !isAdsType) ? (reel.video_type as string) : null;

  const rawThumb = rawVideo?.thumbnail_url ?? rawVideo?.thumbnail ?? "";
  const thumb: string | null = replaceThumbnailUrlForSmallDimensions(rawThumb) || null;

  const rawProfileImage = (reel.owner as { profile_image?: string } | null)?.profile_image ?? "";
  const userThumb: string | null = replaceProfileImageUrlForSmallDimensions(rawProfileImage) || null;

  const user: FeedItemUser = {
    thumb: userThumb,
    name: (reel.owner as { nickname?: string } | null)?.nickname,
    ctaLink: (reel.cta as { link?: string } | null)?.link,
    ctaCaption: (reel.cta as { text?: string } | null)?.text,
    ctaColor: "#0645ff",
  };

  // Ad break: drive from the real backend ad config when present — current
  // `ad_configs.video_ad[0]` or legacy `video.ads_config` (see resolveReelAdConfig).
  // Fall back to the mock waterfall only for flag-enabled tags (dev/demo).
  // `adsDisabled` short-circuits both — no ad break regardless of backend value.
  const adsConfig = resolveReelAdConfig(reel);
  const adObject: NormalisedAd | undefined = adsDisabled
    ? undefined
    : adsConfig?.ads_url
      ? buildReelAdObjectFromConfig(adsConfig, REEL_AD_BREAK_ID_OFFSET + index, gateOnUnmute)
      : adBreakEnabled
        ? buildReelAdObject(index, gateOnUnmute)
        : undefined;

  const kind: "video" | "video-with-ad" = adObject !== undefined ? "video-with-ad" : "video";

  const data: NormalisedReel = {
    kind,
    id: index,
    active: index === 0,
    videoUrl,
    videoType,
    thumb,
    user,
    community: reel.community ?? null,
    cta: (reel.cta as NormalisedReel["cta"]) ?? null,
    loop: (reel.loop as NormalisedReel["loop"]) ?? null,
    ogDetails: (reel.og_details as NormalisedReel["ogDetails"]) ?? null,
    owner: (reel.owner as NormalisedReel["owner"]) ?? null,
    config: reel.config ?? null,
    playerType: undefined,
    video: normaliseVideo(reel.video as NormalisedReel["video"]),
    adObject,
  };

  return { kind, data };
}

/**
 * Normalise a raw ads-type reel into a NormalisedAd entry.
 *
 * @param reel               Raw ads reel.
 * @param index              Zero-based position.
 */
// TODO(gap-8): audioAds detection ignores the isAudioAdsElement gate.
// Old transformReelData gated audioAds on `isAudioAdsElement` (derived from tagDetails.ad_layout).
// normaliseAd has no access to tagDetails, so audioAds is set whenever audio_ad is non-empty.
// Fix: accept `isAudioAdsElement: boolean` param here (or resolve it from tagDetails upstream
// before calling normaliseFeed), and AND it into the audioAds assignment below.
export function normaliseAd(reel: Reel, index: number): { kind: "ad"; data: NormalisedAd } {
  const hasVideoAd = hasAdContent(reel.video_ad);
  const audioAds = hasAdContent(reel.audio_ad);
  const videoAds = hasVideoAd;

  const firstVideoAd = Array.isArray(reel.video_ad)
    ? (reel.video_ad as Record<string, unknown>[])[0]
    : (reel.video_ad as Record<string, unknown> | undefined);

  // video_ad normalisation: array → pass through; object → extract url string
  let videoAd: unknown;
  if (Array.isArray(reel.video_ad)) {
    videoAd = reel.video_ad;
  } else {
    videoAd =
      ((reel.video_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined) ??
      ((reel.audio_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined);
  }

  // ad_url extraction mirrors transformReelData
  let adUrl: string | undefined;
  if (hasVideoAd || audioAds) {
    if (Array.isArray(reel.video_ad)) {
      adUrl = (firstVideoAd?.["url"] as string | undefined) ?? (firstVideoAd?.["ads_url"] as string | undefined);
    } else {
      adUrl =
        ((reel.video_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined) ??
        ((reel.audio_ad as Record<string, unknown> | undefined)?.["url"] as string | undefined);
    }
  }

  const advertiserDetails = firstVideoAd?.["advertiserDetails"] as { logo?: string; primaryColor?: string } | undefined;
  const videoAdAdvertiserDetails =
    hasVideoAd && (advertiserDetails?.logo || advertiserDetails?.primaryColor)
      ? {
          logo: advertiserDetails!.logo as string,
          primaryColor: advertiserDetails!.primaryColor as string,
        }
      : undefined;

  const videoAdContentVideo = hasVideoAd
    ? (firstVideoAd?.["contentVideo"] as
        | { url: string; autoplay: boolean; loop: boolean; muted: boolean; objectFit: string }
        | undefined)
    : undefined;

  const videoPlatform = firstVideoAd?.["platform"] as string | undefined;
  const displayPlatform = (reel.display_ad as { platform?: string } | undefined)?.platform;
  const nativePlatform = (reel.native_ad as { platform?: string } | undefined)?.platform;

  const data = buildAdObject({
    id: index,
    active: index === 0,
    audioAds,
    videoAds,
    videoAd,
    videoAdAdvertiserDetails,
    videoAdContentVideo,
    displayAd: reel.display_ad,
    nativeAd: reel.native_ad,
    videoPlatform,
    nativePlatform,
    displayPlatform,
    adUrl,
    // Standalone ads-type reel — defaults to false (request immediately,
    // don't wait for unmute) unless the backend opts in via gate_on_unmute.
    gateOnUnmute: reel.gate_on_unmute ?? false,
  });

  return { kind: "ad", data };
}

/**
 * Normalise a raw reel array into a FeedEntry array.
 *
 * @param reels           Raw reels from the feed API.
 * @param tagId           Tag id; used for per-reel ad config lookups.
 * @param adBreakEnabled  Whether the mock fullscreen ad-break fallback is active.
 * @param gateOnUnmute    Tag-level default for `NormalisedAd.gateOnUnmute` when the
 *                        backend does not supply an explicit value.
 * @param adsDisabled     Hard kill switch — when true, backend ad slides are dropped
 *                        and no ad break is attached to organic reels.
 */
export function normaliseFeed(
  reels: Reel[],
  tagId: string,
  adBreakEnabled: boolean,
  gateOnUnmute: boolean,
  adsDisabled: boolean
): FeedEntry[] {
  return reels.reduce<FeedEntry[]>((entries, reel, index) => {
    if (reel.type === "ads") {
      // Drop standalone backend ad slides entirely when ads are disabled.
      if (!adsDisabled) entries.push(normaliseAd(reel, index));
      return entries;
    }
    entries.push(normaliseReel(reel, index, tagId, adBreakEnabled, gateOnUnmute, adsDisabled));
    return entries;
  }, []);
}
