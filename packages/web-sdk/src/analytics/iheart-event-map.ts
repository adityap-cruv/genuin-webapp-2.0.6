/**
 * Payload builders: Genuin analytics payload + session snapshot -> iHeart `{ type, data }`.
 *
 * The Genuin `AnalyticsProvider` emits events as `analytics:<EventName value>` (e.g.
 * `analytics:Video Started`) through the internal `onAnalyticsTrack` channel. The bridge
 * keys off those raw value strings (see {@link GenuinEvent}) and drives the streaming
 * lifecycle, calling these builders to construct each iHeart event payload from the
 * `Highlights_AnalyticsSpec_June2026` spec.
 *
 * Properties intentionally OMITTED for v1 (sheet flagged "needs clarification" or not
 * applicable to a web embed):
 *   - `pause.event.location`             — sheet: no value/type, needs clarification
 *   - `track_end.station.completionRate` — sheet: needs clarification
 */

import type { SessionSnapshot } from "./iheart-session";
import type { ExitSpot, IHeartEvent, IHeartEventData, StreamEndReason, TrackEndReason } from "./iheart-types";

/** Raw Genuin event payload (the `eventPayload` from SDKAnalyticsPayload). */
export type GenuinPayload = Record<string, unknown>;

/**
 * Genuin EventName *values* we react to. These are the human-readable strings emitted
 * after the `analytics:` prefix (see `packages/components/.../context.ts`).
 */
export const GenuinEvent = {
  VIDEO_STARTED: "Video Started",
  VIDEO_IMPRESSION: "Video Impression",
  VIDEO_COMPLETED: "Video Complete",
  VIDEO_PAUSED: "Video Paused",
  VIDEO_PLAY: "Video Play",
  VIDEO_MUTED: "Muted",
  VIDEO_UNMUTED: "Unmuted",
  VIDEO_SHARED: "Video Shared",
  EMBED_VIEWED: "Embed Viewed",
  SWIPE_NEXT: "Swipe Next",
  SWIPE_PREVIOUS: "Swipe Previous",
} as const;

const ASSET_TYPE = "highlights" as const;

/** `station.offlineEnabled` — web embed has no offline playback, so this is always `false`. */
const OFFLINE_ENABLED = false as const;

/** Pull a string field from a payload, trying several candidate keys. */
export function pickStr(payload: GenuinPayload, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return undefined;
}

/** Pull a finite number from a payload, trying several candidate keys. */
export function pickNum(payload: GenuinPayload, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = Number(payload[key]);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Genuin nests clip fields inside a `video` object (and occasionally `attributes`). Returns
 * the payload itself plus those nested bags so lookups find keys at either level.
 */
function attributeBags(payload: GenuinPayload): GenuinPayload[] {
  const bags: GenuinPayload[] = [payload];
  for (const key of ["video", "attributes"]) {
    const nested = payload[key];
    if (nested && typeof nested === "object") {
      bags.push(nested as GenuinPayload);
    }
  }
  const videoAttrs = (payload["video"] as GenuinPayload | undefined)?.["attributes"];
  if (videoAttrs && typeof videoAttrs === "object") {
    bags.push(videoAttrs as GenuinPayload);
  }
  return bags;
}

/** Like {@link pickStr} but also searches the nested video/attributes bags. */
function pickStrDeep(payload: GenuinPayload, ...keys: string[]): string | undefined {
  for (const bag of attributeBags(payload)) {
    const value = pickStr(bag, ...keys);
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

/**
 * Per-clip identity used as the lifecycle track key (clip-change detection) and, per prod,
 * also `station.asset.id` (the asset block describes the clip). The parent show/station id
 * lives in `station.asset.sub.id`.
 */
export function clipIdOf(payload: GenuinPayload): string | undefined {
  return pickStrDeep(payload, "content_id", "video_id");
}

/** Current page URL the SDK is rendering in (used as the screen_view pageURL fallback). */
function currentPageUrl(): string | undefined {
  return typeof window !== "undefined" ? window.location.href : undefined;
}

/** Whether the clip began via autoplay. Genuin emits this under `autoplay` (legacy: `video_autoplay`). */
function isAutoplayOf(payload: GenuinPayload): boolean {
  return payload["autoplay"] === true || payload["video_autoplay"] === true;
}

/**
 * `station.asset.id` — id of the highlight CLIP itself. Per prod, the `station.asset` block
 * describes the individual clip (not the parent station), so this is the clip id — the same
 * source as the lifecycle track key ({@link clipIdOf}).
 */
function assetIdOf(payload: GenuinPayload): string | undefined {
  return clipIdOf(payload);
}

/**
 * `station.asset.name` — the clip's caption/description text. Genuin forwards this as `title`
 * (sourced from the post's `descritptionText`); legacy clip keys are fallbacks.
 */
function assetName(payload: GenuinPayload): string | undefined {
  return pickStrDeep(payload, "title", "description_text", "video_title");
}

/**
 * `station.asset.sub.id` — the PARENT container (station/podcast) as an `assetType|id`
 * composite, matching prod (`live|1469`). Live-station highlights use `live|<station_id>`;
 * podcast highlights use `podcast|<podcast_id>`.
 */
function assetSubId(payload: GenuinPayload): string | undefined {
  const stationId = pickStrDeep(payload, "station_id");
  if (stationId !== undefined) {
    return `live|${stationId}`;
  }
  const podcastId = pickStrDeep(payload, "podcast_id");
  if (podcastId !== undefined) {
    return `podcast|${podcastId}`;
  }
  return undefined;
}

/**
 * `station.asset.sub.name` — display name of the parent station/show (prod: `"Z100"`). Genuin
 * forwards this as `section_title`; legacy station/show keys are fallbacks.
 */
function assetSubName(payload: GenuinPayload): string | undefined {
  return pickStrDeep(payload, "section_title", "station_name", "show_name", "brand_name");
}

/**
 * `station.playedFrom` — how the stream was initiated. The SDK schema types this as a REQUIRED
 * `number` (z.number()); the section-name string variant the spec hinted at fails validation.
 * iHeart supplied source codes for specific embed/placement surfaces. Everything else keeps
 * the existing "played immediately" value.
 */
const PLAYED_FROM_IMMEDIATE = 431 as const;
const PLAYED_FROM_BY_EMBED_ID: Record<string, number> = {
  "69c38273686a088a80a25ea2": 432,
};
const PLAYED_FROM_BY_PLACEMENT_ID: Record<string, number> = {
  "69c2812fd98484cf6b83a5ba": 433,
  "6a39a496a7d9f8da7f6e7cca": 434,
  "6a3c5b0dcb0f2cc8d56a2b0d": 435,
};

function playedFrom(payload: GenuinPayload): number {
  const embedPlayedFrom = PLAYED_FROM_BY_EMBED_ID[pickStrDeep(payload, "embed_id") ?? ""];
  if (embedPlayedFrom !== undefined) {
    return embedPlayedFrom;
  }

  const placementPlayedFrom = PLAYED_FROM_BY_PLACEMENT_ID[pickStrDeep(payload, "placement_id") ?? ""];
  if (placementPlayedFrom !== undefined) {
    return placementPlayedFrom;
  }

  return PLAYED_FROM_IMMEDIATE;
}

/** Clip duration (seconds) from the Genuin payload. Genuin emits this as `video_length`. */
function durationOf(payload: GenuinPayload): number | undefined {
  for (const bag of attributeBags(payload)) {
    const value = pickNum(bag, "video_length", "duration", "video_duration");
    if (value !== undefined && value > 0) {
      return value;
    }
  }
  return undefined;
}

/**
 * `station.completionRate` — fraction of the clip watched (0–1, 1 = fully watched).
 * Computed from accumulated listenTime over clip duration; returns undefined when duration
 * is unknown (so the field is omitted rather than sent as a bogus value).
 */
function completionRate(listenTime: number, duration: number | undefined): number | undefined {
  if (duration === undefined) {
    return undefined;
  }
  const ratio = listenTime / duration;
  return Math.min(1, Math.max(0, Math.round(ratio * 100) / 100));
}

/**
 * Nested asset block for the `station.asset` field.
 * The iHeart SDK expects nested objects — NOT flat dotted-key strings.
 */
function assetBlock(payload: GenuinPayload): IHeartEventData["station"] {
  return {
    asset: {
      id: assetIdOf(payload),
      name: assetName(payload),
      sub: {
        id: assetSubId(payload),
        name: assetSubName(payload),
      },
      type: ASSET_TYPE,
    },
  };
}

/** Shared `station` block + stream-level fields for stream/track events. */
function stationBlock(payload: GenuinPayload, session: SessionSnapshot): IHeartEventData["station"] {
  return {
    ...assetBlock(payload),
    sessionId: session.sessionId,
    // Web embed has no preroll and no save concept; prod sends these as constant booleans.
    hadPreroll: false,
    isSaved: false,
    offlineEnabled: OFFLINE_ENABLED,
    streamInitTime: session.streamInitTime,
    playbackStartTime: session.playbackStartTime,
    startPosition: session.startPosition,
    playedFrom: playedFrom(payload),
  };
}

/** Full streaming base data (station + stream-level scalars) for stream/track events. */
function streamingBase(payload: GenuinPayload, session: SessionSnapshot): IHeartEventData {
  return {
    station: stationBlock(payload, session),
    isAutoplay: isAutoplayOf(payload),
    streamIsMute: session.streamIsMute,
    streamFeedPosition: session.streamFeedPosition,
    streamFeedTotal: session.streamFeedTotal,
  };
}

// 01_Stream_Start — once per session. The SDK schema (`ba`) REQUIRES a `view.pageName`.
export function buildStreamStart(payload: GenuinPayload, session: SessionSnapshot): IHeartEvent {
  return {
    type: "stream_start",
    data: { ...streamingBase(payload, session), view: { pageName: pageNameOf(payload) } },
  };
}

// 04_Track_Start — per clip. Adds station.subSessionId (the per-track id) on top of the
// shared streaming base; stream_start carries no subSessionId.
export function buildTrackStart(payload: GenuinPayload, session: SessionSnapshot): IHeartEvent {
  const data = streamingBase(payload, session);
  data.station = { ...data.station, subSessionId: session.subSessionId };
  return { type: "track_start", data };
}

// 05_Track_End — per clip. listenTime is dual-sent (see bridge).
export function buildTrackEnd(
  payload: GenuinPayload,
  session: SessionSnapshot,
  endReason: TrackEndReason
): IHeartEvent {
  const base = streamingBase(payload, session);
  return {
    type: "track_end",
    data: {
      ...base,
      station: {
        ...base.station,
        // Same per-track id as the matching track_start (set at openTrack, still current here).
        subSessionId: session.subSessionId,
        endReason,
        completionRate: completionRate(session.listenTime, durationOf(payload)),
        listenTime: session.listenTime,
      },
    },
  };
}

// 02_Stream_End — once per session. listenTime is dual-sent (see bridge).
// Carries the full shared `stationBlock` (asset id/name/sub, hadPreroll/isSaved/offlineEnabled/
// streamInitTime/playbackStartTime/startPosition/playedFrom/sessionId), built from the retained
// last clip's payload. NOTE: the prod stream_end capture had `asset.id`/`asset.name` as empty
// strings, but we send the last clip's real values (prod likely lost them on exit since the exit
// event has no clip payload — the same gap our `lastPayload` retention fixes on our side).
// `isAutoplay` is omitted (every other streaming event carries it; prod omits it on stream_end).
export function buildStreamEnd(
  payload: GenuinPayload,
  session: SessionSnapshot,
  endReason: StreamEndReason,
  exitSpot: ExitSpot = "music"
): IHeartEvent {
  return {
    type: "stream_end",
    data: {
      station: {
        ...stationBlock(payload, session),
        endReason,
        exitSpot,
        listenTime: session.listenTime,
      },
      streamIsMute: session.streamIsMute,
      streamFeedPosition: session.streamFeedPosition,
      streamFeedTotal: session.streamFeedTotal,
    },
  };
}

// 03_Play — play/resume button. The SDK schema (`st`) REQUIRES `view.pageName`.
export function buildPlay(payload: GenuinPayload, session: SessionSnapshot): IHeartEvent {
  return {
    type: "play",
    data: {
      station: {
        ...assetBlock(payload),
        sessionId: session.sessionId,
        playedFrom: playedFrom(payload),
      },
      view: { pageName: pageNameOf(payload) },
    },
  };
}

// 08_Pause — interaction. Minimal station (asset + playedFrom + sessionId). The SDK schema (`st`)
// REQUIRES `view.pageName`. `event.location` is iHeart page/component taxonomy
// (e.g. "live_profile_highlight_card") that only the host can supply — omitted here.
export function buildPause(payload: GenuinPayload, session: SessionSnapshot): IHeartEvent {
  return {
    type: "pause",
    data: {
      station: {
        ...assetBlock(payload),
        playedFrom: playedFrom(payload),
        sessionId: session.sessionId,
      },
      view: { pageName: pageNameOf(payload) },
    },
  };
}

// 06_Share — interaction. share.platform = snake_case of the chosen method.
export function buildShare(payload: GenuinPayload): IHeartEvent {
  return {
    type: "share",
    data: {
      station: {
        ...assetBlock(payload),
        offlineEnabled: OFFLINE_ENABLED,
      },
      share: {
        platform: mapSharePlatform(pickStr(payload, "share_platform", "share_method")),
      },
    },
  };
}

/**
 * `pageName` for the current view — `live_profile` (live) / `podcast_profile` (podcast), derived
 * from the parent-container type. Required on `screen_view` (top level) and on the streaming events'
 * `view` block. Falls back to the payload `page_name`.
 */
function pageNameOf(payload: GenuinPayload): string | undefined {
  const parentType = assetSubId(payload)?.split("|")[0];
  return parentType === "podcast"
    ? "podcast_profile"
    : parentType === "live"
      ? "live_profile"
      : pickStr(payload, "page_name");
}

// 07_Screen_View — emitted as the SDK `screen_view` event. Per the SDK schema (`fa`): `pageName`
// is REQUIRED at the top level; the parent container lives at `view.asset` (the SDK has no
// `view.item`):
//   pageName               = live_profile (live) / podcast_profile (podcast)
//   view.pageURL           = current page URL
//   view.asset.id          = `<parentType>|<parentId>`  (e.g. live|1469, podcast|1234)
//   view.asset.name        = station call letters / show name (e.g. WHTZ-FM)
//   view.asset.sub.id      = `<parentType>|highlights`  (e.g. live|highlights)
export function buildScreenView(payload: GenuinPayload): IHeartEvent {
  // assetSubId already yields `<parentType>|<parentId>` (live|<station_id> ‖ podcast|<podcast_id>).
  const parentRef = assetSubId(payload);
  const parentType = parentRef?.split("|")[0];
  return {
    type: "screen_view",
    data: {
      pageName: pageNameOf(payload),
      view: {
        pageURL: pickStr(payload, "url") ?? currentPageUrl(),
        asset: {
          id: parentRef,
          name: assetSubName(payload),
          sub: { id: parentType === undefined ? undefined : `${parentType}|${ASSET_TYPE}` },
        },
      },
    },
  };
}

/**
 * Map our share method to iHeart's `share.platform` enum (camelCase identifiers, e.g.
 * `linkCopied`). The web embed only produces two methods: the native OS share sheet, or a
 * link copy. `linkCopied` is confirmed against prod; `nativeShare` is a best guess pending the
 * `06_Share` spec enum — TODO(analytics): confirm and extend if iHeart enumerates more platforms.
 */
const SHARE_PLATFORM_MAP: Record<string, string> = {
  copy_link: "linkCopied",
  link_copied: "linkCopied",
  native_share: "nativeShare",
};

function mapSharePlatform(method?: string): string | undefined {
  if (!method) {
    return undefined;
  }
  return SHARE_PLATFORM_MAP[method.trim().toLowerCase()] ?? method;
}
