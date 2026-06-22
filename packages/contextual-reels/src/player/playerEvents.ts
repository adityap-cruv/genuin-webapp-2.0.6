/**
 * Player event hooks — consolidated from:
 *   player/types.ts  (re-exported)
 *   player/useQuartileEvents.ts
 *   player/usePlayStartedEvents.ts
 *   player/useActiveVideoIdBroadcast.ts
 */
import { useEffect } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import type { PlayerDims, PlayerHandle } from "@cxr/player/types";
import { createLogger } from "@cxr/utils/logger";

// ─── Player types (re-exported from types.ts) ─────────────────────────────────

export type { PlayerHandle, VideoMode, PlayerDims, LightPlayerProps } from "@cxr/player/types";

// ─── useQuartileEvents ────────────────────────────────────────────────────────

/** Options for `useQuartileEvents`. */
export interface UseQuartileEventsOptions {
  tagDetails: Record<string, unknown>;
  videoDetails: Record<string, unknown>;
  dims?: PlayerDims;
  /** Analytics emit function. */
  sendEvent: (name: string, payload?: Record<string, unknown>) => void;
  /** Called on every `timeupdate` tick so the parent can track watch duration. */
  onTimeUpdate?: (currentTime: number, duration: number, id: number) => void;
  /** Numeric identifier for this reel item, forwarded to `onTimeUpdate`. */
  itemId: number;
  /** Called after `video_completed` for non-ad-placement video items. */
  onEnded?: () => void;
  /** Quartile events are only emitted when this is `true`. */
  isVideoItem: boolean;
}

/** Result of `useQuartileEvents`. */
export interface UseQuartileEventsResult {
  /**
   * Register `timeupdate` and `ended` listeners on the given player.
   * Must be called once inside the Vlitejs `onReady` callback.
   *
   * @example
   * attachToPlayer(player);
   */
  attachToPlayer(player: PlayerHandle): void;

  /**
   * Reset quartile deduplication flags for a new play cycle.
   * Called from `usePlayStartedEvents` on the native `play` event.
   *
   * @param currentTime - Native video `currentTime` at the moment of reset.
   *                      Reset only happens when `currentTime <= 0.1` OR
   *                      the video had previously ended (`_wasEnded`).
   *
   * @example
   * resetForPlay(0);
   */
  resetForPlay(currentTime: number | undefined): void;
}

function safeRound(n: unknown): number {
  return typeof n === "number" && isFinite(n) ? Math.round(n) : 0;
}

/**
 * Manages quartile tracking for a single video item.
 *
 * State is kept in plain closure variables rather than React state to avoid
 * re-renders on every `timeupdate` tick (which can fire ~30 fps).
 *
 * @example
 * const quartile = useQuartileEvents({ tagDetails, videoDetails, sendEvent, itemId, onEnded, isVideoItem });
 * // inside onReady:
 * quartile.attachToPlayer(player);
 */
export function useQuartileEvents({
  videoDetails,
  sendEvent,
  onTimeUpdate,
  itemId,
  onEnded,
  isVideoItem,
}: UseQuartileEventsOptions): UseQuartileEventsResult {
  // Closure state — intentionally NOT React state.
  let _quartilesSent = { q1: false, q2: false, q3: false, q4: false };
  let _wasEnded = false;

  function buildPayload(duration: number, currentTime: number): Record<string, unknown> {
    return {
      duration: safeRound(duration),
      watch_time: safeRound(currentTime),
    };
  }

  function resetForPlay(currentTime: number | undefined): void {
    const isAtStart = typeof currentTime === "number" && currentTime <= 0.1;
    if (isAtStart || _wasEnded) {
      _quartilesSent = { q1: false, q2: false, q3: false, q4: false };
      _wasEnded = false;
    }
  }

  function attachToPlayer(player: PlayerHandle): void {
    player.on("ended", () => {
      _wasEnded = true;

      if (!_quartilesSent.q4) {
        Promise.all([player.getDuration(), player.getCurrentTime()])
          .then(([duration, currentTime]) => {
            sendEvent(EVENT.VIDEO_COMPLETED, buildPayload(duration, currentTime));
          })
          .catch(() => {
            sendEvent(EVENT.VIDEO_COMPLETED, buildPayload(0, 0));
          });
        _quartilesSent.q4 = true;
      }

      // Advance the feed only for non-ad-placement video items.
      if (isVideoItem && (!videoDetails["ad_placement"] || videoDetails["ad_placement"] !== "end-roll")) {
        onEnded?.();
      }
    });

    player.on("timeupdate", () => {
      Promise.all([player.getDuration(), player.getCurrentTime()])
        .then(([duration, currentTime]) => {
          onTimeUpdate?.(currentTime, duration, itemId);

          if (typeof duration !== "number" || duration <= 0) return;

          const pct = (currentTime / duration) * 100;
          const payload = buildPayload(duration, currentTime);

          if (pct >= 25 && !_quartilesSent.q1) {
            sendEvent(EVENT.VIDEO_FIRST_QUARTILE, payload);
            _quartilesSent.q1 = true;
          }
          if (pct >= 50 && !_quartilesSent.q2) {
            sendEvent(EVENT.VIDEO_MIDPOINT, payload);
            _quartilesSent.q2 = true;
          }
          if (pct >= 75 && !_quartilesSent.q3) {
            sendEvent(EVENT.VIDEO_THIRD_QUARTILE, payload);
            _quartilesSent.q3 = true;
          }
          if (pct >= 100 && !_quartilesSent.q4) {
            sendEvent(EVENT.VIDEO_COMPLETED, payload);
            _quartilesSent.q4 = true;
          }
        })
        .catch(() => {
          // Non-fatal — missing timeupdate data is expected during buffering.
        });
    });
  }

  return { attachToPlayer, resetForPlay };
}

// ─── usePlayStartedEvents ─────────────────────────────────────────────────────

const _logger = createLogger("cxr/player");

/**
 * How long after a user click a subsequent `playing` event is considered
 * "user-initiated" (triggers `video_play_started`).
 * Exported so tests can reference it without magic numbers.
 */
export const RECENT_CLICK_WINDOW_MS = 2000;

/** Options for `usePlayStartedEvents`. */
export interface UsePlayStartedEventsOptions {
  tagDetails: Record<string, unknown>;
  videoDetails: Record<string, unknown>;
  dims?: PlayerDims;
  /** Analytics emit function. */
  sendEvent: (name: string, payload?: Record<string, unknown>) => void;
  /**
   * Returns the `Date.now()` timestamp of the last user-initiated play click.
   * Parent (ReelItem / LightPlayer) sets this via `lastUserPlayAtRef`.
   */
  getLastUserPlayAt: () => number;
  /**
   * Called from the native `play` event listener to notify
   * `useQuartileEvents.resetForPlay` that a new play cycle has begun.
   */
  onPlayReset?: () => void;
}

/** Result of `usePlayStartedEvents`. */
export interface UsePlayStartedEventsResult {
  /**
   * Register Vlitejs + native event listeners on the given player.
   * Must be called once inside the Vlitejs `onReady` callback.
   *
   * @example
   * attachToPlayer(player);
   */
  attachToPlayer(player: PlayerHandle): void;
}

/**
 * Wires `video_started`, `video_play_started`, and `video_play_interrupted`
 * event emission for a single reel item.
 *
 * @example
 * const playEvents = usePlayStartedEvents({ tagDetails, videoDetails, sendEvent, getLastUserPlayAt });
 * // inside onReady:
 * playEvents.attachToPlayer(player);
 */
export function usePlayStartedEvents({
  // dims: _dims,
  sendEvent,
  getLastUserPlayAt,
  onPlayReset,
}: UsePlayStartedEventsOptions): UsePlayStartedEventsResult {
  function attachToPlayer(player: PlayerHandle): void {
    // Closure state — NOT React state.
    let _playSent = false;
    let _startedSent = false;

    function sendVideoStarted(): void {
      Promise.all([player.getDuration(), player.getCurrentTime()])
        .then(([duration, currentTime]) => {
          sendEvent(EVENT.VIDEO_STARTED, {
            duration: safeRound(duration),
            watch_time: safeRound(currentTime),
          });
        })
        .catch(() => {
          sendEvent(EVENT.VIDEO_STARTED, { duration: 0, watch_time: 0 });
        });
    }

    function sendPlayEvent(): void {
      if (_playSent) return;
      _playSent = true;
      sendEvent(EVENT.VIDEO_PLAY_STARTED, {});
    }

    // Vlitejs `pause` — reset deduplication and emit interrupted.
    player.on("pause", () => {
      _playSent = false;
      Promise.all([player.getDuration(), player.getCurrentTime()])
        .then(([duration, currentTime]) => {
          sendEvent(EVENT.VIDEO_PLAY_INTERRUPTED, {
            duration: safeRound(duration),
            watch_time: safeRound(currentTime),
          });
        })
        .catch(() => {
          sendEvent(EVENT.VIDEO_PLAY_INTERRUPTED, { duration: 0, watch_time: 0 });
        });
    });

    // Attach native element listeners via the player handle or its underlying element.
    try {
      const inst = (player.getInstance?.() ?? player) as HTMLVideoElement & typeof player;
      if (inst && typeof inst.addEventListener === "function") {
        // Native `play` — new play cycle begins.
        inst.addEventListener("play", () => {
          _startedSent = false;
          onPlayReset?.();
        });

        // Native `playing` — frames are actually rendering.
        inst.addEventListener("playing", () => {
          if (_startedSent) return;
          _startedSent = true;

          const recentClick = Date.now() - getLastUserPlayAt() < RECENT_CLICK_WINDOW_MS;

          player
            .getCurrentTime()
            .then((ct) => {
              const isRestart = typeof ct === "number" && ct <= 0.1;

              if (isRestart) {
                sendVideoStarted();
                if (recentClick && !_playSent) sendPlayEvent();
                return;
              }

              // Not a restart
              if (recentClick) {
                if (!_playSent) sendPlayEvent();
              } else {
                sendVideoStarted();
              }
            })
            .catch(() => {
              // Fallback: treat unknown time as a restart
              sendVideoStarted();
              if (recentClick && !_playSent) sendPlayEvent();
            });
        });
      }
    } catch (e) {
      _logger.warn("native play listener attach failed", e);
    }
  }

  return { attachToPlayer };
}

// ─── useActiveVideoIdBroadcast ────────────────────────────────────────────────

/** Options for `useActiveVideoIdBroadcast`. */
export interface UseActiveVideoIdBroadcastOptions {
  /** The current video's identifier. No event is dispatched for empty/undefined values. */
  videoId?: string;
}

/**
 * Emits a `genai:videoId` event onto the per-instance {@link CxrEventBus}
 * whenever `videoId` changes to a non-empty string.
 *
 * Uses the bus rather than `window` to prevent cross-instance bleed when
 * multiple widgets are mounted on the same page.
 *
 * @param options.videoId - The active video identifier.
 *
 * @example
 * useActiveVideoIdBroadcast({ videoId: item.videoId });
 */
export function useActiveVideoIdBroadcast({ videoId }: UseActiveVideoIdBroadcastOptions): void {
  const bus = useEventBus();

  useEffect(() => {
    if (videoId && typeof videoId === "string" && videoId.trim() !== "") {
      bus.emit("genai:videoId", { videoId });
    }
  }, [videoId, bus]);
}
