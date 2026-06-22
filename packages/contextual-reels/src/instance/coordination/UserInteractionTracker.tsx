"use client";
/**
 * Per-instance "has the user interacted with cxr?" flag.
 *
 * Each widget instance owns its own tracker (provided via
 * {@link UserInteractionProvider}, mirroring `EventBusProvider`), so a tap on
 * one widget never flips the flag for another widget on the same page. The flag
 * starts `false` and flips to `true` on the first user interaction *within that
 * instance*. Once `true` it never returns to `false` for the lifetime of the
 * instance — there is intentionally no reset API.
 *
 * Read it reactively in components via {@link useUserInteracted}; flip it from a
 * DOM handler via the function returned by {@link useMarkUserInteracted}.
 */
import { createContext, useContext, useRef, useSyncExternalStore, type ReactNode } from "react";

/**
 * Holds the interaction flag for a single widget instance and notifies React
 * subscribers when it first flips. Methods are bound fields so they can be
 * passed directly as handlers / `useSyncExternalStore` arguments with stable
 * identity across renders.
 */
export class UserInteractionTracker {
  private interacted = false;
  private readonly subscribers = new Set<() => void>();

  /** Mark interaction. Idempotent: only the first call flips + notifies. */
  mark = (): void => {
    if (this.interacted) return;
    this.interacted = true;
    for (const notify of this.subscribers) notify();
  };

  /** Current value of the instance interaction flag. */
  hasInteracted = (): boolean => this.interacted;

  /**
   * Subscribe to flag changes (fires at most once, when it flips to `true`).
   * Returns an unsubscribe function. Used by {@link useUserInteracted}.
   */
  subscribe = (onChange: () => void): (() => void) => {
    this.subscribers.add(onChange);
    return () => {
      this.subscribers.delete(onChange);
    };
  };
}

const UserInteractionContext = createContext<UserInteractionTracker | undefined>(undefined);

interface UserInteractionProviderProps {
  children: ReactNode;
}

/**
 * Provide a per-instance {@link UserInteractionTracker} to the React tree.
 *
 * The tracker is created once via a ref and never replaced — stable across
 * renders. Mount once at the App root, inside (or alongside) `InstanceProvider`.
 */
export function UserInteractionProvider({ children }: UserInteractionProviderProps): ReactNode {
  const trackerRef = useRef<UserInteractionTracker | null>(null);
  if (trackerRef.current === null) {
    trackerRef.current = new UserInteractionTracker();
  }
  return (
    <UserInteractionContext.Provider value={trackerRef.current}>
      {children}
    </UserInteractionContext.Provider>
  );
}

/** Stable no-op subscribe used when there is no enclosing provider. */
const noopSubscribe = (): (() => void) => () => undefined;
const alwaysFalse = (): boolean => false;
const noop = (): void => undefined;

/**
 * React hook returning this instance's interaction flag. Re-renders the
 * consumer once when the user first interacts with this widget.
 *
 * Degrades safely outside a {@link UserInteractionProvider}: an atom rendered on
 * its own (Storybook, tests, non-ad contexts) reports `false` rather than
 * throwing, so the mute enticement defaults to the sound-on icon.
 */
export function useUserInteracted(): boolean {
  const tracker = useContext(UserInteractionContext);
  return useSyncExternalStore(
    tracker?.subscribe ?? noopSubscribe,
    tracker?.hasInteracted ?? alwaysFalse,
    tracker?.hasInteracted ?? alwaysFalse
  );
}

/**
 * Returns the stable `mark` callback for this instance's tracker. Attach it to
 * DOM interaction handlers to flip the flag on first use. No-ops when there is
 * no enclosing {@link UserInteractionProvider}.
 */
export function useMarkUserInteracted(): () => void {
  return useContext(UserInteractionContext)?.mark ?? noop;
}
