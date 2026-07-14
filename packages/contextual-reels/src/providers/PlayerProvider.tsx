"use client";
/**
 * PlayerProvider — owns global mute/play state for the feed.
 *
 * Responsibilities:
 *  - Owns `volume: number` (defaults to 0 — plays unmuted but silent). `isMuted`
 *    is derived as `volume === 0` and drives the mute icon.
 *  - Owns `isPlaying: boolean` (defaults to true).
 *  - Exposes `setVolume`, `setMuted` and `setPlaying` via `usePlayer()`.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";

/**
 * Volume applied when the user unmutes from silence (control-layer tap, expand,
 * mute-toggle). Starts low so the first burst of sound is gentle.
 */
export const DEFAULT_UNMUTE_VOLUME = 0.2;

/** Context value exposed via usePlayer. */
export interface PlayerContextValue {
  /** Current audible volume, 0..1. The single source of truth for sound level. */
  volume: number;
  /** Whether the active player is silent — derived from `volume === 0`; drives the mute icon. */
  isMuted: boolean;
  /** Whether the active player is in play state. */
  isPlaying: boolean;
  /** True while a fullscreen ad break has its ad/cover on screen — hides widget chrome. */
  isAdBreakActive: boolean;
  /** Set the audible volume directly (0..1). */
  setVolume: (volume: number) => void;
  /**
   * Convenience toggle: `true` silences (volume 0), `false` unmutes to the tag's
   * `initialVolume` when set (incl. the `gen_init_volume` override), else
   * {@link DEFAULT_UNMUTE_VOLUME}.
   */
  setMuted: (muted: boolean) => void;
  /**
   * Signal that the browser blocked unmuted autoplay. Drops volume to 0 so the
   * app state (and the mute icon) match the now-silent element. The user can
   * unmute from there with a gesture.
   */
  notifyAutoplayBlocked: () => void;
  /** Update playing state. */
  setPlaying: (playing: boolean) => void;
  /** Set whether a fullscreen ad break is currently active. */
  setAdBreakActive: (active: boolean) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

/**
 * Provide mute/play state to the feed component tree.
 *
 * @example
 * ```tsx
 * <PlayerProvider>
 *   <Feed ... />
 * </PlayerProvider>
 * ```
 */
export function PlayerProvider({ children }: PlayerProviderProps): ReactNode {
  const { initialVolume } = useStrategy();
  // Start at the tag's configured initialVolume (0 by default — plays unmuted
  // but silent, showing the "unmute" prompt). Lazy init so a later strategy
  // re-resolve doesn't reset a level the user has since changed.
  const [volume, setVolume] = useState(() => initialVolume);
  const isMuted = volume === 0;
  // Fix #1: autoplay on by default — muted so browsers allow it without a gesture.
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAdBreakActive, setAdBreakActive] = useState(false);
  const bus = useEventBus();
  const { setBaseEventContext } = useAnalytics();

  // Publish live volume / mute state so AnalyticsProvider can stamp `volume` +
  // `is_muted` onto every event (video and ad). Runs on each change, including
  // volume-slider drags that don't cross the mute threshold.
  useEffect(() => {
    setBaseEventContext({ volume, is_muted: isMuted });
  }, [volume, isMuted, setBaseEventContext]);

  // Level a manual unmute restores to when currently silent. Honours the tag's
  // configured `initialVolume` (which the `gen_init_volume` loader param may
  // override) so an audible-start tag unmutes back to its own level; otherwise
  // falls back to the shared gentle default.
  const unmuteRestoreVolume = initialVolume > 0 ? initialVolume : DEFAULT_UNMUTE_VOLUME;

  // Toggle between silence and the restore level. Unmuting from 0 jumps to
  // `unmuteRestoreVolume`; unmuting when already audible leaves the level alone.
  const setMuted = useCallback(
    (muted: boolean) => {
      setVolume((prev) => (muted ? 0 : prev > 0 ? prev : unmuteRestoreVolume));
    },
    [unmuteRestoreVolume]
  );

  useEffect(() => {
    if (isPlaying) {
      bus.emit("player:play", {});
    } else {
      bus.emit("player:pause", {});
    }
  }, [isPlaying, bus]);

  const isMountRef = useRef(true);
  useEffect(() => {
    // Skip the initial mount emission — starting unmuted at volume 0 is not a
    // real user-initiated unmute and must not mute other widgets on the page.
    if (isMountRef.current) {
      isMountRef.current = false;
      return;
    }
    if (!isMuted) {
      bus.emit("mute:unmuted", {});
    }
  }, [isMuted, bus]);

  // Expand-view always starts with sound — covers every entry path
  // (expand button, compact tap-to-expand, video:expand, native fullscreen).
  // Bumps a silent player to `unmuteRestoreVolume`; leaves an audible one as-is.
  useEffect(() => {
    const unsubEnter = bus.on("fullscreen:enter", () => setMuted(false));
    return () => unsubEnter();
  }, [bus, setMuted]);

  // Browser blocked unmuted autoplay → drop to volume 0 so app state and the
  // mute icon match the now-silent element. The single source of truth is volume,
  // so this is all the state change needed.
  const notifyAutoplayBlocked = useCallback(() => {
    setVolume(0);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      volume,
      isMuted,
      isPlaying,
      isAdBreakActive,
      setVolume,
      setMuted,
      setPlaying: setIsPlaying,
      setAdBreakActive,
      notifyAutoplayBlocked,
    }),
    [
      volume,
      isMuted,
      isPlaying,
      isAdBreakActive,
      setVolume,
      setMuted,
      setIsPlaying,
      setAdBreakActive,
      notifyAutoplayBlocked,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

/**
 * Hook accessor for the player context.
 *
 * @throws Error when called outside a {@link PlayerProvider}.
 */
export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used inside <PlayerProvider>");
  }
  return ctx;
}
