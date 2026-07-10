/**
 * Core analytics utilities for the contextual-reels widget.
 *
 * Consolidates: eventNames, eventBuffer, sendEventLog.
 */

import { hostMacros as defaultHostMacros, type HostMacros } from "@cxr/hostMacros";
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
  TAG_INIT: "Tag Init",
  TAG_CAPTURED: "Tag Captured",
  TAG_DISPLAYED: "Tag Displayed",
  FEED_API_CALL_COMPLETED: "Feed API Call Completed",
  BATCH_STARTED: "Batch Started",
  BATCH_COMPLETED: "Batch Completed",
  FEED_COMPLETED: "Feed Completed",
  SCROLL: "Scroll",
  VIDEO_LOADED: "Video Loaded",
  VIDEO_STARTED: "Video Started",
  VIDEO_PLAY_STARTED: "Video Play Started",
  VIDEO_PLAY_INTERRUPTED: "Video Play Interrupted",
  VIDEO_WATCH: "Video Watch",
  VIDEO_FIRST_QUARTILE: "Video First Quartile",
  VIDEO_MIDPOINT: "Midpoint",
  VIDEO_THIRD_QUARTILE: "Video Third Quartile",
  VIDEO_COMPLETED: "Video Complete",
  VIDEO_PLAY: "Video Play",
  VIDEO_PAUSED: "Video Paused",
  VIDEO_MUTED: "Muted",
  VIDEO_UNMUTED: "Unmuted",
  SWIPE_NEXT: "Swipe Next",
  SWIPE_PREVIOUS: "Swipe Previous",
  VIDEO_SHARED: "Video Shared",
  EMBED_MAXIMIZED: "Embed Maximized",
  EMBED_MINIMIZED: "Embed Minimized",
  EMBED_CTA_CLICKED: "Embed CTA Clicked",
  AD_REQUEST: "Ad Request",
  AD_RESPONSE: "Ad Response",
  AD_COMPLETE: "Ad Complete",
  AD_START: "Ad Start",
  AD_REQUESTED: "Ad Requested",
  AD_RESPONSE_RECEIVED: "Ad Response Received",
  AD_IMPRESSION: "Ad Impression",
  AD_REQUEST_FAILED: "Ad Request Failed",
  // Title-case events mirrored from gen-ad-container so CXR emits the same
  // analytics vocabulary across both in-feed ad implementations.
  AD_STARTED: "Ad Started",
  AD_RENDERED: "Ad Rendered",
  AD_RENDER_FAILED: "Ad Render Failed",
  AD_COMPLETED: "Ad Completed",
  AD_ERROR: "Ad Error",
  AD_MEDIA_QUARTILE: "Ad Media Quartile",
  AD_SKIPPED: "Ad Skipped",
  AD_CLICKED: "Ad Clicked",
  AD_PAUSED: "Ad Paused",
  AD_PASSBACK: "Ad Passback",
  CTA_CLICK: "CTA Click",
  SHARE: "Share",
  SPARK: "Spark",
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
  /** Captured host macros. Defaults to the module singleton. */
  hostMacros?: HostMacros;
}

/** Host macros split into the three analytics blocks they belong in. */
export interface HostMacroBlocks {
  device: Record<string, string>;
  user: Record<string, string>;
  event: Record<string, string>;
}

/**
 * Split captured host macros into analytics blocks by meaning.
 *
 * DEFERRED (see design spec §Deferred): the exact target field names must be
 * confirmed with the analytics consumers. Update THIS function when confirmed —
 * it is the single source of truth for host-macro analytics placement. Host geo
 * (country/loc/lat/long) lands in its OWN device fields and never overwrites the
 * IP-based `geoip` block.
 */
export function buildHostMacroBlocks(macros: HostMacros): HostMacroBlocks {
  const pick = (target: Record<string, string>, field: string, macro: string): void => {
    const value = macros[macro];
    if (value !== undefined && value !== "") target[field] = value;
  };

  const device: Record<string, string> = {};
  pick(device, "app_name", "appn");
  pick(device, "app_version", "appv");
  pick(device, "app_bundle", "appb");
  pick(device, "app_country", "country");
  pick(device, "app_loc", "loc");
  pick(device, "app_lat", "loclat");
  pick(device, "app_long", "loclong");

  const user: Record<string, string> = {};
  pick(user, "ifa", "ifa");
  pick(user, "deviceid", "deviceid");
  pick(user, "app_store_id", "appsi");

  const event: Record<string, string> = {};
  pick(event, "gdpr", "gdpr");
  pick(event, "gdpr_consent", "gdpr_consent");
  pick(event, "us_privacy", "us_privacy");
  pick(event, "dnt", "dnt");

  return { device, user, event };
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

  const resolvedMacros = deps.hostMacros ?? defaultHostMacros;
  const macroBlocks = buildHostMacroBlocks(resolvedMacros);
  // Webview: the host app (appb bundle) is the "page". Overrides windowLink.
  const page = resolvedMacros.appb ?? windowLink;

  const updatedEventDetails: Record<string, unknown> = {
    // Host macros go first so caller-supplied eventDetails / offsite still win.
    ...macroBlocks.event,
    ...eventDetails,
    page,
    ...(tagDetails.tag_id !== undefined ? { tag_id: tagDetails.tag_id } : {}),
    // Only stamp video fields from videoDetails when present, so a caller that
    // already put video_id / video_share_string on eventDetails (e.g. CXR's
    // per-video LightPlayer wrapper) isn't clobbered with undefined.
    ...(videoDetails.video?.slug ? { video_share_string: videoDetails.video.slug } : {}),
    loop_share_string: videoDetails.loop?.share_string ?? "",
    ...(videoDetails.video?.id ? { video_id: videoDetails.video.id } : {}),
  };

  const mergedEventDetails = deepMergeOverwrite(
    updatedEventDetails,
    offsite.event_details ?? offsite.eventDetails ?? {}
  );

  // Host macros go first so the real device snapshot / user_id win on any
  // future key collision — host macros are additive, never clobbering.
  const mergedDeviceDetails = deepMergeOverwrite(
    { ...macroBlocks.device, ...(deviceDetails as unknown as Record<string, unknown>) },
    offsite.device_details ?? offsite.deviceDetails ?? {}
  );

  const mergedUserDetails = deepMergeOverwrite(
    { ...macroBlocks.user, user_id: userId },
    offsite.user_details ?? offsite.userDetails ?? {}
  );

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
    hostMacros: defaultHostMacros,
  });
}
