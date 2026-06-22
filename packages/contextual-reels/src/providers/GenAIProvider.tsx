"use client";
/**
 * GenAIProvider — bridges GenAI SDK custom events to React state.
 *
 * The GenAI SDK dispatches events on `window`. This provider bridges them into
 * the per-instance `CxrEventBus` so that multiple widget instances on the same
 * page cannot cross-contaminate each other's state.
 *
 * Two concerns are handled in separate effects:
 *  1. Window → bus bridge: re-emits window events onto the per-instance bus.
 *  2. Bus → state: updates React state from bus events.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { isGenAiAllowed } from "@cxr/config";
import type { GenAiStatus } from "@cxr/feed/hooks/useGenAiSwipeGate";
import { useEventBus } from "@cxr/instance/coordination/EventBusContext";

// Re-export so consumers can import from this module without a separate dep.
export type { GenAiStatus };

/** Context value exposed by `useGenAI`. */
export interface GenAIContextValue {
  /** Whether the current tag is on the GenAI allow list. */
  isAllowed: boolean;
  /**
   * Fraction (0–1) of the player container the active reel's Octo sheet
   * occupies. Drives the Instagram-style split: the player shrinks to
   * `(1 - octoFraction)` so it sits above the sheet instead of being overlaid.
   * Only the active reel writes this. 0 = no split (collapsed/overlay states).
   */
  octoFraction: number;
  /** Set the active reel's Octo sheet fraction (clamped to 0–1). */
  setOctoFraction: (fraction: number) => void;
  /**
   * Split axis for the active reel's Octo layout. `"y"` = vertical shrink
   * (player above sheet, default). `"x"` = horizontal 50/50 (300×250 split).
   */
  octoAxis: "x" | "y";
  /** Set the active reel's split axis. */
  setOctoAxis: (axis: "x" | "y") => void;
}

const GenAIContext = createContext<GenAIContextValue | undefined>(undefined);

interface GenAIProviderProps {
  children: ReactNode;
  /** Tag id used to check the GenAI allow list. */
  tagId: string;
}

/**
 * Provide GenAI status to the component tree.
 *
 * Bridges GenAI SDK window events into the per-instance {@link CxrEventBus} and
 * translates bus events into React state. Requires `EventBusProvider` as an
 * ancestor.
 *
 * @example
 * ```tsx
 * <EventBusProvider>
 *   <GenAIProvider tagId={tagId}>
 *     <Feed ... />
 *   </GenAIProvider>
 * </EventBusProvider>
 * ```
 */
export function GenAIProvider({ children, tagId }: GenAIProviderProps): ReactNode {
  const [octoFraction, setOctoFractionState] = useState(0);
  const [octoAxis, setOctoAxisState] = useState<"x" | "y">("y");
  const isAllowed = isGenAiAllowed(tagId);
  const bus = useEventBus();

  // Clamp to [0, 1]; only write on real change to avoid churn while the active
  // reel re-applies the same fraction across renders.
  const setOctoFraction = useCallback((fraction: number) => {
    const clamped = Math.min(1, Math.max(0, fraction));
    setOctoFractionState((prev) => (prev === clamped ? prev : clamped));
  }, []);

  // Only write on real change to avoid churn.
  const setOctoAxis = useCallback((axis: "x" | "y") => {
    setOctoAxisState((prev) => (prev === axis ? prev : axis));
  }, []);

  // ── 1. Window → bus bridge ──────────────────────────────────────────────────
  // The GenAI SDK dispatches on window; we cannot change that. Re-emit onto the
  // per-instance bus so only this instance's tree reacts.
  useEffect(() => {
    function onWindowOnFill(): void {
      bus.emit("genai:onFill", {});
    }
    function onWindowOnNoFill(): void {
      bus.emit("genai:onNoFill", {});
    }
    window.addEventListener("genai:onFill", onWindowOnFill);
    window.addEventListener("genai:onNoFill", onWindowOnNoFill);

    return () => {
      window.removeEventListener("genai:onFill", onWindowOnFill);
      window.removeEventListener("genai:onNoFill", onWindowOnNoFill);
    };
  }, [bus]);

  const value = useMemo<GenAIContextValue>(
    () => ({ isAllowed, octoFraction, setOctoFraction, octoAxis, setOctoAxis }),
    [isAllowed, octoFraction, setOctoFraction, octoAxis, setOctoAxis]
  );

  return <GenAIContext.Provider value={value}>{children}</GenAIContext.Provider>;
}

/**
 * Hook accessor for the GenAI context.
 *
 * @throws Error when called outside a {@link GenAIProvider}.
 *
 * @example
 * ```tsx
 * const { isAllowed, octoFraction, setOctoFraction } = useGenAI();
 * ```
 */
export function useGenAI(): GenAIContextValue {
  const ctx = useContext(GenAIContext);
  if (!ctx) {
    throw new Error("useGenAI must be used inside <GenAIProvider>");
  }
  return ctx;
}

/** Derived player/sheet split for one reel, returned by {@link useOctoSplit}. */
export interface OctoSplit {
  /** Raw fraction (0–1) the active reel's sheet occupies. */
  octoFraction: number;
  /**
   * True when this reel is active and its sheet owns part of the container
   * (panel/full states). Chrome hides and the player pauses while true.
   */
  splitActive: boolean;
  /**
   * Fraction (0–1) of the container the player should occupy: `1 - octoFraction`
   * while active, otherwise `1` (a backgrounded reel never shrinks).
   */
  playerShare: number;
  /** Split axis for the active reel: `"x"` = 50/50 horizontal, `"y"` = vertical. */
  octoAxis: "x" | "y";
}

/**
 * Derive the player/sheet split for a single reel from the shared Octo fraction.
 * Only the active reel reacts; inactive reels — which read the same shared value
 * — always report "no split" so a backgrounded reel can't be held shrunk by the
 * active one.
 *
 * Unlike {@link useGenAI}, this does **not** throw outside a provider: the split
 * is an enhancement layer that control chrome must tolerate without it (and
 * renders in isolated tests with no provider). A missing provider degrades to
 * `octoFraction = 0`, i.e. "no split".
 *
 * @param isActive Whether this reel is the active one.
 * @returns {@link OctoSplit}
 */
export function useOctoSplit(isActive: boolean): OctoSplit {
  const ctx = useContext(GenAIContext);
  const octoFraction = ctx?.octoFraction ?? 0;
  const octoAxis = ctx?.octoAxis ?? "y";
  return useMemo<OctoSplit>(
    () => ({
      octoFraction,
      octoAxis,
      splitActive: isActive && octoFraction > 0,
      playerShare: isActive ? 1 - octoFraction : 1,
    }),
    [isActive, octoFraction, octoAxis]
  );
}
