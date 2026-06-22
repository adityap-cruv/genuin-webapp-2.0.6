/**
 * iHeart analytics bridge.
 *
 * Subscribes to the internal `onAnalyticsTrack` event stream (the same stream surfaced to
 * host pages via `genuin.on('onAnalyticsTrack')`) and translates Genuin analytics events
 * into the iHeart streaming lifecycle (stream/track start & end, play, pause, share,
 * screen_view), forwarding each to the iHeart Analytics SDK.
 *
 * Forwarding is gated by `window.iHeartAnalytics` being present + ready (also serves as
 * iHeart-page detection).
 *
 * Lifecycle model (Stream = whole viewing session, Track = one clip):
 *   - First "Video Started"  -> stream_start (+ track_start for that clip)
 *   - "Video Started" on a new clip -> track_end(next) for the old clip,
 *                                       then track_start for the new clip
 *   - "Video Paused"         -> pause (+ track_end(pause), closing the track)
 *   - "Video Play" (resume)  -> play (+ track_start, reopening the track)
 *   - "Video Complete"       -> track_end(new_clip_start) only; stream stays open (clip boundary,
 *                                not session end). The next clip's "Video Started" opens a new track
 *                                in the SAME session. stream_end fires on exit, below.
 *   - tab hidden / backgrounded -> track_end(pause) only; the stream STAYS OPEN so a tab-switch
 *                                does not fragment one viewing into multiple sessions. Resume
 *                                (Video Play / Video Started) reopens the track in the same session.
 *   - page hide / SDK destroy with a session open -> track_end(navigation) + stream_end(navigation)
 *   - "Muted"/"Unmuted"      -> update mute state (no event)
 *   - "Swipe Next/Previous"  -> update feed position (boundary handled by next Video Started)
 */

import type { EventListener, EventManager, SDKEvent } from "../core/events";

import {
  buildPause,
  buildPlay,
  buildScreenView,
  buildShare,
  buildStreamEnd,
  buildStreamStart,
  buildTrackEnd,
  buildTrackStart,
  clipIdOf,
  GenuinEvent,
  pickNum,
  type GenuinPayload,
} from "./iheart-event-map";
import { isIHeartSdkReady, logIHeartEvent, raiseIHeartEvent } from "./iheart-sdk-adapter";
import { IHeartSession } from "./iheart-session";
import type { IHeartEvent, StreamEndReason, TrackEndReason } from "./iheart-types";

/** The internal event name the AnalyticsProvider emits on (SDKEventName.ANALYTICS). */
const ANALYTICS_EVENT = "onAnalyticsTrack";
const ANALYTICS_PREFIX = "analytics:";

/** Payload shape carried by the onAnalyticsTrack event. */
interface AnalyticsEventPayload {
  eventName: string;
  eventPayload?: GenuinPayload;
}

/** 1-based feed position from the Genuin payload (position_index is 0-based). */
function feedPositionOf(payload: GenuinPayload): number | undefined {
  const index = pickNum(payload, "position_index", "video_index");
  return index === undefined ? undefined : index + 1;
}

/**
 * Orchestrates the iHeart streaming lifecycle for a single embed/session.
 * Pure of the SDK and the flag — given Genuin events it produces ordered iHeart events.
 * Exported for unit testing without the SDK/EventManager.
 */
export class IHeartLifecycle {
  private readonly session: IHeartSession;
  private readonly emit: (event: IHeartEvent) => void;
  /**
   * Last payload carrying clip/station context. On exit (pagehide/destroy) the originating event
   * has no payload, so the trailing track_end/stream_end would lose `asset.sub`, `playedFrom`,
   * etc. We retain the last clip's payload to keep that context on the closing events.
   */
  private lastPayload: GenuinPayload = {};

  constructor(emit: (event: IHeartEvent) => void, session: IHeartSession = new IHeartSession()) {
    this.emit = emit;
    this.session = session;
  }

  /** Handle a single Genuin analytics event (name = value after the `analytics:` prefix). */
  handle(name: string, payload: GenuinPayload): void {
    if (payload && Object.keys(payload).length > 0) {
      this.lastPayload = payload;
    }
    switch (name) {
      case GenuinEvent.VIDEO_STARTED:
        this.onClipPlay(payload, { isResume: false });
        break;
      case GenuinEvent.VIDEO_PLAY:
        this.emit(buildPlay(payload, this.session.snapshot()));
        this.onClipPlay(payload, { isResume: true });
        break;
      case GenuinEvent.VIDEO_PAUSED:
        this.emit(buildPause(payload, this.session.snapshot()));
        // this.closeTrack(payload, "pause");
        break;
      case GenuinEvent.VIDEO_COMPLETED:
        // A clip finishing is a TRACK boundary, not a session end. The stream stays open so
        // one viewing session spans the whole feed (shared sessionId); stream_end fires only
        // on feed-exit (pagehide/visibility/destroy) via finalizeOnExit.
        // endReason `new_clip_start`: completion auto-advances to the next clip (matches prod).
        this.closeTrack(payload, "new_clip_start");
        break;
      case GenuinEvent.VIDEO_SHARED:
        this.emit(buildShare(payload));
        break;
      case GenuinEvent.EMBED_VIEWED:
        this.emit(buildScreenView(payload));
        break;
      case GenuinEvent.VIDEO_MUTED:
        this.session.setMute(true);
        break;
      case GenuinEvent.VIDEO_UNMUTED:
        this.session.setMute(false);
        break;
      case GenuinEvent.SWIPE_NEXT:
      case GenuinEvent.SWIPE_PREVIOUS: {
        const position = feedPositionOf(payload);
        if (position !== undefined) {
          this.session.setFeedPosition(position);
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Closes any open session, emitting the trailing track_end + stream_end. Called on page
   * hide / SDK destroy so a session that ends by navigation is still reported.
   */
  // Default resolves to `this.lastPayload` at call time — only valid when invoked on the instance
  // (all current call sites use `() => lifecycle.finalizeOnExit()`), not as a detached reference.
  finalizeOnExit(payload: GenuinPayload = this.lastPayload): void {
    if (!this.session.isActive) {
      return;
    }
    // Leaving the page/feed = `navigation` (matches prod + the SDK endReason enum, which has no
    // `exit_app`); the trailing track also closes as `navigation`.
    this.finalizeSession(payload, { trackReason: "navigation", streamReason: "navigation" });
  }

  /**
   * Tab hidden / backgrounded: close the open clip with a pause but keep the stream open, so a
   * tab-switch is not counted as a session end. Idempotent — no-op when no track is open
   * (e.g. the clip was already paused via "Video Paused").
   */
  pauseOnHidden(payload: GenuinPayload = this.lastPayload): void {
    this.closeTrack(payload, "pause");
  }

  // --- internals -----------------------------------------------------------

  private applyFeedState(payload: GenuinPayload): void {
    const total = pickNum(payload, "total_videos", "video_count");
    if (total !== undefined) {
      this.session.setFeedTotal(total);
    }
    const position = feedPositionOf(payload);
    if (position !== undefined) {
      this.session.setFeedPosition(position);
    }
  }

  private onClipPlay(payload: GenuinPayload, { isResume }: { isResume: boolean }): void {
    this.applyFeedState(payload);

    if (!this.session.isActive) {
      this.session.startStream();
      this.emit(buildStreamStart(payload, this.session.snapshot()));
    }

    const clipId = clipIdOf(payload) ?? null;
    const clipChanged = this.session.clipId !== clipId;

    // A different clip began while a track was still open -> end the previous track.
    // `next`: a new clip started while the previous was still playing (skip/swipe without a
    // natural finish) — distinct from `new_clip_start`, which is a clip that played to completion
    // and auto-advanced (see VIDEO_COMPLETED). (`next` is the SDK enum's skip-to-next value.)
    if (this.session.isTrackOpen && clipChanged) {
      this.emit(buildTrackEnd(payload, this.session.snapshot(), "next"));
      this.session.closeTrack();
    }

    // Open a track when none is open, or when the clip changed. A resume on the same clip
    // with a still-open track does not double-emit.
    if (!this.session.isTrackOpen || clipChanged) {
      const position = feedPositionOf(payload);
      const startPosition = pickNum(payload, "start_position") ?? 0;
      this.session.openTrack(clipId, position, isResume ? startPosition : 0);
      this.emit(buildTrackStart(payload, this.session.snapshot()));
    }
  }

  private closeTrack(payload: GenuinPayload, reason: TrackEndReason): void {
    if (this.session.isTrackOpen) {
      this.emit(buildTrackEnd(payload, this.session.snapshot(), reason));
      this.session.closeTrack();
    }
  }

  private finalizeSession(
    payload: GenuinPayload,
    { trackReason, streamReason }: { trackReason: TrackEndReason; streamReason: StreamEndReason }
  ): void {
    if (this.session.isTrackOpen) {
      this.emit(buildTrackEnd(payload, this.session.snapshot(), trackReason));
      this.session.closeTrack();
    }
    if (this.session.isActive) {
      this.emit(buildStreamEnd(payload, this.session.snapshot(), streamReason));
      this.session.endStream();
    }
  }
}

/** Raises an iHeart event, dual-sending station.listenTime as a global attribute too. */
function raiseWithDualSend(event: IHeartEvent): void {
  // listenTime is nested under station; dual-send as the same nested shape setGlobalData expects.
  const listenTime = event.data.station?.listenTime;
  const attributes = listenTime !== undefined ? { station: { listenTime } } : undefined;
  raiseIHeartEvent(event, attributes);
}

/**
 * Starts the bridge. Returns an unsubscribe function (no-op when disabled).
 *
 * @param eventManager - the SDK's internal EventManager singleton.
 */
export function startIHeartAnalyticsBridge(eventManager: EventManager): () => void {
  const lifecycle = new IHeartLifecycle((event) => {
    // Re-check on every emit: the iHeart SDK may load after our init.
    const ready = isIHeartSdkReady();
    // Log before the gate so events are inspectable locally even when window.iHeartAnalytics
    // is absent.
    logIHeartEvent(event, ready);
    if (ready) {
      raiseWithDualSend(event);
    }
  });

  const listener: EventListener = (event: SDKEvent) => {
    const payload = event.payload as AnalyticsEventPayload | undefined;
    if (!payload?.eventName?.startsWith(ANALYTICS_PREFIX)) {
      return;
    }
    lifecycle.handle(payload.eventName.slice(ANALYTICS_PREFIX.length), payload.eventPayload ?? {});
  };

  // `onAnalyticsTrack` is in ALLOWED_EVENTS; the EventManager keys by raw string.
  const unsubscribe = eventManager.on(ANALYTICS_EVENT as unknown as SDKEvent["type"], listener);

  // Report a session that ends by navigation/tab close rather than Video Complete.
  const onExit = () => lifecycle.finalizeOnExit();
  const onVisibility = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      // Backgrounding pauses the clip but keeps the session open (pagehide ends it).
      lifecycle.pauseOnHidden();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", onExit);
    document.addEventListener("visibilitychange", onVisibility);
  }

  return () => {
    unsubscribe();
    lifecycle.finalizeOnExit();
    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", onExit);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}
