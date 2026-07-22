"use client";
/**
 * Per-widget instance identity: the opaque instance id, the per-instance
 * {@link CxrEventBus}, and the per-instance {@link UserInteractionTracker}.
 *
 * These three were previously separate providers/contexts
 * (`instance/registry/InstanceContext`, `instance/coordination/EventBusContext`,
 * `instance/coordination/UserInteractionTracker`). Merged into one context
 * because all three are stable-per-instance values created once via a ref, with
 * no dependencies on each other or on anything else in the tree — three
 * boundaries for the same "who am I, on this page" concern. Mount once at the
 * App root.
 */
import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

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

interface InstanceContextValue {
  instanceId: string;
  bus: CxrEventBus;
  tracker: UserInteractionTracker;
}

const InstanceContext = createContext<InstanceContextValue | undefined>(undefined);

interface InstanceProviderProps {
  instanceId: string;
  // Optional in the type only so `React.createElement(InstanceProvider, { instanceId }, ...children)`
  // type-checks — React always supplies children from the trailing createElement args at runtime.
  children?: ReactNode;
}

/**
 * Provide this widget instance's id, event bus, and interaction tracker to the
 * React tree. The bus and tracker are created once via a ref and never
 * replaced — stable across renders. Mount once at the App root.
 */
export function InstanceProvider({ instanceId, children }: InstanceProviderProps): ReactNode {
  const valueRef = useRef<InstanceContextValue | null>(null);
  if (valueRef.current === null) {
    valueRef.current = { instanceId, bus: new CxrEventBus(), tracker: new UserInteractionTracker() };
  }
  // instanceId is stable for the lifetime of a widget instance, but keep the
  // context value in sync with the latest prop rather than freezing it at
  // first mount.
  valueRef.current.instanceId = instanceId;

  return <InstanceContext.Provider value={valueRef.current}>{children}</InstanceContext.Provider>;
}

/**
 * Returns the instanceId for the nearest enclosing {@link InstanceProvider}.
 *
 * @throws Error when called outside a provider (programming error).
 */
export function useInstanceId(): string {
  const ctx = useContext(InstanceContext);
  if (ctx === undefined) {
    throw new Error("useInstanceId must be used inside <InstanceProvider>");
  }
  return ctx.instanceId;
}

/**
 * Returns the {@link CxrEventBus} for the nearest enclosing {@link InstanceProvider}.
 *
 * @throws Error when called outside a provider (programming error).
 */
export function useEventBus(): CxrEventBus {
  const ctx = useContext(InstanceContext);
  if (!ctx) {
    throw new Error("useEventBus must be used inside <InstanceProvider>");
  }
  return ctx.bus;
}

/**
 * Like {@link useEventBus} but returns `undefined` instead of throwing when
 * there is no enclosing provider. For components that may render standalone
 * (Storybook, isolated atoms, tests) and must degrade gracefully rather than
 * crash — they simply get no bus events.
 */
export function useOptionalEventBus(): CxrEventBus | undefined {
  return useContext(InstanceContext)?.bus;
}

/** Stable no-op subscribe used when there is no enclosing provider. */
const noopSubscribe = (): (() => void) => () => undefined;
const alwaysFalse = (): boolean => false;
const noop = (): void => undefined;

/**
 * React hook returning this instance's interaction flag. Re-renders the
 * consumer once when the user first interacts with this widget.
 *
 * Degrades safely outside a {@link InstanceProvider}: an atom rendered on its
 * own (Storybook, tests, non-ad contexts) reports `false` rather than
 * throwing, so the mute enticement defaults to the sound-on icon.
 */
export function useUserInteracted(): boolean {
  const tracker = useContext(InstanceContext)?.tracker;
  return useSyncExternalStore(
    tracker?.subscribe ?? noopSubscribe,
    tracker?.hasInteracted ?? alwaysFalse,
    tracker?.hasInteracted ?? alwaysFalse
  );
}

/**
 * Returns the stable `mark` callback for this instance's tracker. Attach it to
 * DOM interaction handlers to flip the flag on first use. No-ops when there is
 * no enclosing {@link InstanceProvider}.
 */
export function useMarkUserInteracted(): () => void {
  return useContext(InstanceContext)?.tracker.mark ?? noop;
}
