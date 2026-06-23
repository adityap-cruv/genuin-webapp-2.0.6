/**
 * Core analytics utilities for the contextual-reels widget.
 *
 * Consolidates: eventNames, eventBuffer, sendEventLog.
 */

import type { DeviceDetails } from "@cxr/platform/device";
import { deepMergeOverwrite } from "@cxr/utils/deepMerge";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/analytics");

// ─── Event vocabulary ─────────────────────────────────────────────────────────

/**
 * Canonical analytics event vocabulary for the contextual-reels widget.
 *
 * Values are passed verbatim to `rudderanalytics.track(...)`.
 * DO NOT rename strings without coordinating with the analytics consumers.
 */
export const EVENT = {
  TAG_INIT: "tag_init",
  TAG_CAPTURED: "tag_captured",
  TAG_DISPLAYED: "tag_displayed",
  FEED_API_CALL_COMPLETED: "feed_api_call_completed",
  BATCH_STARTED: "batch_started",
  BATCH_COMPLETED: "batch_completed",
  FEED_COMPLETED: "feed_completed",
  SCROLL: "scroll",
  VIDEO_LOADED: "video_loaded",
  VIDEO_STARTED: "video_started",
  VIDEO_PLAY_STARTED: "video_play_started",
  VIDEO_PLAY_INTERRUPTED: "video_play_interrupted",
  VIDEO_WATCH: "video_watch",
  VIDEO_FIRST_QUARTILE: "video_first_quartile",
  VIDEO_MIDPOINT: "video_midpoint",
  VIDEO_THIRD_QUARTILE: "video_third_quartile",
  VIDEO_COMPLETED: "video_completed",
  AD_REQUEST: "ad_request",
  AD_RESPONSE: "ad_response",
  AD_IMPRESSION_SNAKE: "ad_impression",
  AD_ERROR: "ad_error",
  AD_COMPLETE: "ad_complete",
  AD_REQUESTED_TITLE: "Ad Requested",
  AD_RESPONSE_RECEIVED: "Ad Response Received",
  AD_IMPRESSION_TITLE: "Ad Impression",
  AD_REQUEST_FAILED: "Ad Request Failed",
  AD_PASSBACK: "Ad Passback",
  CTA_CLICK: "cta_click",
  SHARE: "share",
  SPARK: "spark",
} as const;

/** Union of every analytics event name string emitted by the widget. */
export type EventName = (typeof EVENT)[keyof typeof EVENT];

// ─── Event buffer ─────────────────────────────────────────────────────────────

/** Function invoked for each queued event on flush, and for live events afterwards. */
export type EventEmitter = (eventName: string, payload?: unknown) => void;

/** Public surface of the event buffer. */
export interface EventBuffer {
  /** Enqueue (or directly emit when already flushed) a single event. */
  enqueue: (eventName: string, payload?: unknown) => void;
  /** Emit every queued event in FIFO order, then mark the buffer as flushed. */
  flush: (emit: EventEmitter) => void;
  /** Number of events currently held in the buffer (zero after flush). */
  size: () => number;
  /** Whether `flush` has been called. */
  isFlushed: () => boolean;
}

interface QueuedEvent {
  readonly name: string;
  readonly payload: unknown;
}

/**
 * Create a new FIFO event buffer.
 *
 * Retains events until `flush` is called, then becomes a pass-through.
 *
 * @returns An {@link EventBuffer}.
 */
export function createEventBuffer(): EventBuffer {
  let queue: QueuedEvent[] = [];
  let flushed = false;
  let liveEmitter: EventEmitter | undefined;

  return {
    enqueue(eventName, payload) {
      if (flushed && liveEmitter) {
        liveEmitter(eventName, payload);
        return;
      }
      queue.push({ name: eventName, payload });
    },
    flush(emit) {
      if (flushed) return;
      flushed = true;
      liveEmitter = emit;
      const pending = queue;
      queue = [];
      for (const evt of pending) {
        emit(evt.name, evt.payload);
      }
    },
    size() {
      return queue.length;
    },
    isFlushed() {
      return flushed;
    },
  };
}

// ─── sendEventLog ─────────────────────────────────────────────────────────────

/** Minimal Rudderstack surface we depend on. */
export interface RudderstackLike {
  track: (eventName: string, payload: Record<string, unknown>) => void;
}

/** Per-call event metadata. All fields are optional. */
export interface EventDetails {
  readonly [key: string]: unknown;
}

/** Per-call video metadata. The widget passes the unmodified server response. */
export interface VideoDetailsLike {
  video?: { id?: string; slug?: string };
  loop?: { share_string?: string };
}

/** Per-call tag metadata. */
export interface TagDetailsLike {
  tag_id?: string;
}

/** The arguments object exposed to call sites. */
export interface SendEventLogArgs {
  eventName: string;
  eventDetails?: EventDetails;
  videoDetails?: VideoDetailsLike;
  tagDetails?: TagDetailsLike;
}

/** Offsite override shape as the embedder may set on `window`. */
export interface OffsitePropertiesConfig {
  event_details?: Record<string, unknown>;
  eventDetails?: Record<string, unknown>;
  device_details?: Record<string, unknown>;
  deviceDetails?: Record<string, unknown>;
  user_details?: Record<string, unknown>;
  userDetails?: Record<string, unknown>;
}

/** Dependencies for {@link sendEventLog}. */
export interface SendEventLogDeps {
  rudderanalytics: RudderstackLike | undefined;
  deviceDetails: DeviceDetails;
  userId: string;
  windowLink: string | undefined;
  offsite: OffsitePropertiesConfig;
}

/**
 * Dispatch a single analytics event. Pure function — see {@link SendEventLogDeps}.
 *
 * No-op (with a console.error) when `deps.rudderanalytics` is missing.
 *
 * @param args  Event name + optional metadata.
 * @param deps  Injected dependencies (rudderanalytics, device, user context).
 */
export function sendEventLog(args: SendEventLogArgs, deps: SendEventLogDeps): void {
  const { rudderanalytics } = deps;
  if (!rudderanalytics) {
    _logger.error("RudderAnalytics is not initialized.");
    return;
  }

  const { eventName, eventDetails = {}, videoDetails = {}, tagDetails = {} } = args;
  const { deviceDetails, userId, windowLink, offsite } = deps;

  const updatedEventDetails: Record<string, unknown> = {
    ...eventDetails,
    page: windowLink,
    ...(tagDetails.tag_id !== undefined ? { tag_id: tagDetails.tag_id } : {}),
    video_share_string: videoDetails.video?.slug,
    loop_share_string: videoDetails.loop?.share_string ?? "",
    video_id: videoDetails.video?.id,
  };

  const mergedEventDetails = deepMergeOverwrite(
    updatedEventDetails,
    offsite.event_details ?? offsite.eventDetails ?? {}
  );

  const mergedDeviceDetails = deepMergeOverwrite(
    deviceDetails as unknown as Record<string, unknown>,
    offsite.device_details ?? offsite.deviceDetails ?? {}
  );

  const mergedUserDetails = deepMergeOverwrite({ user_id: userId }, offsite.user_details ?? offsite.userDetails ?? {});

  // Immutable: offsite config cannot override the incoming event name.
  const finalEventName = eventName;

  rudderanalytics.track(finalEventName, {
    event_name: finalEventName,
    event_details: mergedEventDetails,
    device_details: mergedDeviceDetails,
    user_details: mergedUserDetails,
  });
}

/** Convenience args for {@link sendEventLogFromGlobals} — omits the globals. */
export interface SendEventLogFromGlobalsDeps {
  deviceDetails: DeviceDetails;
  userId: string;
  windowLink: string | undefined;
}

/**
 * Convenience wrapper that reads `window.rudderanalytics` and
 * `window.offsitePropertiesConfig` for callers without a full DI context.
 *
 * @param args  Event name + optional metadata.
 * @param deps  Partial deps — globals are resolved from `window`.
 */
export function sendEventLogFromGlobals(args: SendEventLogArgs, deps: SendEventLogFromGlobalsDeps): void {
  const win = window as Window & {
    rudderanalytics?: RudderstackLike;
    offsitePropertiesConfig?: OffsitePropertiesConfig;
  };
  sendEventLog(args, {
    ...deps,
    rudderanalytics: win.rudderanalytics,
    offsite: win.offsitePropertiesConfig ?? {},
  });
}
