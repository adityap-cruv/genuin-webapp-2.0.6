/**
 * Types for the iHeart Analytics SDK integration.
 *
 * The iHeart Analytics SDK is loaded by the host page (iHeart article / highlights pages)
 * and exposed globally as `window.iHeartAnalytics`. We forward Genuin analytics events to
 * it via {@link IHeartAnalyticsSDK.track}.
 *
 * Reference: iHeart Analytics SDK storybook (packages-analytics-sdk-readme).
 */

/**
 * iHeart event `type` strings accepted by `track({ type, data })`.
 *
 * Only the subset relevant to the highlights/article clips feed is listed; this matches
 * the `Highlights_AnalyticsSpec` sheet tabs.
 */
export type IHeartEventType =
  | "stream_start"
  | "stream_end"
  | "track_start"
  | "track_end"
  | "play"
  | "pause"
  | "screen_view"
  | "share";

/**
 * Reason a stream (viewing session) ended — `station.endReason` on `stream_end`.
 * Values must be members of the SDK's `endReason` enum (its zod schema rejects anything else).
 */
export type StreamEndReason =
  | "new_station_start"
  | "new_episode_start"
  | "stop"
  | "navigation"
  | "pause"
  | "audio_interruption"
  | "error";

/**
 * Reason a track (single clip) ended — `station.endReason` on `track_end`.
 * Values must be members of the SDK's `endReason` enum. Note: `next` (skip to next clip) and
 * `navigation` (left the feed) — the SDK has no `next_clip_start`/`exit_app`.
 */
export type TrackEndReason =
  | "new_clip_start"
  | "next"
  | "stop"
  | "navigation"
  | "scan"
  | "pause"
  | "audio_interruption"
  | "error";

/** Content playing at the time of event — `station.exitSpot` on `stream_end`. */
export type ExitSpot = "music" | "ad" | "fill" | "unknown";

/** Nested asset identity block used inside `station` and `view`. */
export interface IHeartAsset {
  id?: string;
  name?: string;
  sub?: { id?: string; name?: string };
  type?: "highlights";
}

/** Nested `station` block present on all streaming events. */
export interface IHeartStation {
  asset?: IHeartAsset;
  sessionId?: string;
  /** Per-track id identifying one clip play within the session. track_start/track_end only. */
  subSessionId?: string;
  /** Whether a preroll played before the stream. Web embed has none → always false. */
  hadPreroll?: boolean;
  /** Whether the clip is saved to the user's library. Not applicable to the embed → false. */
  isSaved?: boolean;
  /** Whether offline playback is enabled. Not applicable to the embed → false. */
  offlineEnabled?: boolean;
  /** Epoch-ms when the stream init began (constant for the session; equals stream-start time). */
  streamInitTime?: number;
  playbackStartTime?: number;
  startPosition?: number;
  /** How the stream was initiated: iHeart numeric source code. */
  playedFrom?: number | string;
  endReason?: StreamEndReason | TrackEndReason;
  exitSpot?: ExitSpot;
  listenTime?: number;
  /** Fraction of the clip watched (0–1, 1 = fully watched). track_end only. */
  completionRate?: number;
}

/**
 * The `data` payload for an iHeart `track()` call.
 * The iHeart SDK expects nested objects — NOT flat dotted-key strings.
 */
export interface IHeartEventData {
  station?: IHeartStation;
  isAutoplay?: boolean;
  streamIsMute?: boolean;
  streamFeedPosition?: number;
  streamFeedTotal?: number;

  // share
  share?: { platform?: string };

  /**
   * `screen_view` — `pageName` is a REQUIRED top-level field in the SDK schema (NOT under `view`).
   * Streaming events (`stream_start`, `play`, `pause`) instead require `view.pageName`.
   */
  pageName?: string;

  /**
   * The SDK `view` block. For `screen_view` it carries `pageURL` + the parent-container `asset`;
   * for streaming events only `pageName` is required. The parent asset lives at `view.asset`
   * (the SDK has no `view.item` — that was our earlier mis-shape).
   */
  view?: {
    pageName?: string;
    pageURL?: string;
    asset?: {
      id?: string;
      name?: string;
      sub?: { id?: string };
    };
  };

  [key: string]: unknown;
}

/** A single event to raise to iHeart. */
export interface IHeartEvent {
  type: IHeartEventType;
  data: IHeartEventData;
}

/**
 * Minimal surface of the global iHeart Analytics SDK that we depend on.
 * Defined locally (not provided by iHeart as a typed package).
 */
export interface IHeartAnalyticsSDK {
  enabled: boolean;
  track: (event: { type: string; data: Record<string, unknown> }) => void;
  setGlobalData: (data: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    iHeartAnalytics?: IHeartAnalyticsSDK;
  }
}
