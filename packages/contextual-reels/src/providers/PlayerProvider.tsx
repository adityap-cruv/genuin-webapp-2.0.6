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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useEventBus } from "@cxr/instance/coordination/EventBusContext";

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
  /** Set the audible volume directly (0..1). */
  setVolume: (volume: number) => void;
  /** Convenience toggle: `true` silences (volume 0), `false` unmutes to {@link DEFAULT_UNMUTE_VOLUME}. */
  setMuted: (muted: boolean) => void;
  /** Update playing state. */
  setPlaying: (playing: boolean) => void;
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
  // Start at volume 0 — the element plays unmuted (muted=false) but silent, so
  // the mute icon shows the "unmute" prompt until the user raises the volume.
  const [volume, setVolume] = useState(0);
  const isMuted = volume === 0;
  // Fix #1: autoplay on by default — muted so browsers allow it without a gesture.
  const [isPlaying, setIsPlaying] = useState(true);
  const bus = useEventBus();

  // Toggle between silence and a gentle default level. Unmuting from 0 jumps to
  // DEFAULT_UNMUTE_VOLUME; unmuting when already audible leaves the level alone.
  const setMuted = useCallback((muted: boolean) => {
    setVolume((prev) => (muted ? 0 : prev > 0 ? prev : DEFAULT_UNMUTE_VOLUME));
  }, []);

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
  // Bumps a silent player to DEFAULT_UNMUTE_VOLUME; leaves an audible one as-is.
  useEffect(() => {
    return bus.on("fullscreen:enter", () => setMuted(false));
  }, [bus, setMuted]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      volume,
      isMuted,
      isPlaying,
      setVolume,
      setMuted,
      setPlaying: setIsPlaying,
    }),
    [volume, isMuted, isPlaying, setMuted]
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
