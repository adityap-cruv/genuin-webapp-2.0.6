"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

/**
 * Single-active-video coordinator.
 *
 * Mirrors the pattern the embed grid view uses (`<EmbedTile
 * isActive={activeIndex === index}>` in `embed-tile-item.tsx`) — a
 * shared "which one is active" id that every cell reads. Only the
 * cell whose id matches the active id receives `play={true}`; the
 * rest pause.
 *
 * `claimedRef` is the synchronous seat — the **first** cell whose
 * `useState` lazy initializer runs claims it. Subsequent cells see
 * a non-null ref and stay paused. The lazy initializer pattern
 * runs during render, before any effect, so the claiming cell can
 * mount its `<VideoPlayer>` with `play={true}` from the very first
 * frame and avoid the async-init race in `initializePlayer`.
 *
 * Strict-mode safety: useState lazy initializers run twice in dev,
 * but the ref check is idempotent — the second invocation sees
 * `claimedRef.current === id` and returns the same `true` without
 * stomping a different cell's claim.
 */

interface PlaybackContextValue {
  activeId: string | null;
  setActive: (id: string) => void;
  release: (id: string) => void;
  claimedRef: MutableRefObject<string | null>;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackCoordinator({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const claimedRef = useRef<string | null>(null);

  const setActive = useCallback((id: string) => setActiveId(id), []);
  const release = useCallback((id: string) => setActiveId((prev) => (prev === id ? null : prev)), []);

  const value = useMemo(() => ({ activeId, setActive, release, claimedRef }), [activeId, setActive, release]);

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error("usePlayback must be used inside a <PlaybackCoordinator>");
  }
  return ctx;
}
