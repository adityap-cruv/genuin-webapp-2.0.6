"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { EventBus, EventHandler } from "./event-bus";
import type { EventRecord } from "./event-queue";
import type { EventSurfaceEventMap, SurfaceEventName } from "./event-surface.types";

/**
 * The bus for the enclosing surface. `null` outside a provider so the hooks can
 * raise a useful error instead of a generic "cannot read property of undefined".
 */
const EventSurfaceContext = createContext<EventBus<EventSurfaceEventMap> | null>(null);

/**
 * Id of the enclosing panel. Read implicitly by {@link useEmit} and
 * {@link useSurfaceEvent} so a participating child never has to thread its own
 * identity through props.
 */
const PanelIdContext = createContext<string | null>(null);

/** @internal — mounted by `EventSurface`, not part of the public API. */
export const EventSurfaceProvider = EventSurfaceContext.Provider;
/** @internal — mounted by `EventSurfacePanel`, not part of the public API. */
export const PanelIdProvider = PanelIdContext.Provider;

/** Panel id used when a child emits from outside any `EventSurfacePanel`. */
export const ORPHAN_PANEL_ID = "__unscoped__";

/**
 * The enclosing surface's bus.
 *
 * @throws If called outside an `EventSurface`. Silent no-op would be worse: a
 *   panel whose events vanish is far harder to debug than an explicit throw.
 */
export function useEventSurface(): EventBus<EventSurfaceEventMap> {
  const bus = useContext(EventSurfaceContext);
  if (!bus) {
    throw new Error("useEventSurface must be used inside an <EventSurface>.");
  }
  return bus;
}

/**
 * The enclosing surface's bus, or `null` outside one.
 *
 * Use this for a component that should work both inside and outside a surface —
 * a video player that broadcasts when it happens to be on a surface, and stays
 * silent otherwise.
 */
export function useOptionalEventSurface(): EventBus<EventSurfaceEventMap> | null {
  return useContext(EventSurfaceContext);
}

/**
 * Id of the enclosing `EventSurfacePanel`, or {@link ORPHAN_PANEL_ID} when the
 * caller sits directly under the surface with no panel wrapper.
 */
export function usePanelId(): string {
  return useContext(PanelIdContext) ?? ORPHAN_PANEL_ID;
}

/**
 * A stable emit function bound to the enclosing panel's id.
 *
 * The identity never changes across renders, so it is safe in dependency arrays
 * and as a prop to a memoised child.
 *
 * @example
 * ```tsx
 * const emit = useEmit();
 * emit("video:change", { videoId, communityId, groupId, index, previousVideoId });
 * ```
 */
export function useEmit() {
  const bus = useEventSurface();
  const panelId = usePanelId();

  const panelIdRef = useRef(panelId);
  panelIdRef.current = panelId;

  return useCallback(
    <K extends SurfaceEventName<EventSurfaceEventMap>>(type: K, payload: EventSurfaceEventMap[K]): boolean =>
      bus.emit(type, payload, panelIdRef.current),
    [bus]
  );
}

/**
 * Subscribe to `type` for the lifetime of the component.
 *
 * The handler is held in a ref, so re-rendering with a fresh inline closure does
 * NOT tear down and re-register the subscription — you can pass an inline arrow
 * without memoising it.
 *
 * Events emitted by this component's own panel are not delivered (echo
 * suppression); pass `{ includeOwn: true }` to opt out, e.g. for a debug logger.
 */
export function useSurfaceEvent<K extends SurfaceEventName<EventSurfaceEventMap>>(
  type: K,
  handler: EventHandler<EventSurfaceEventMap[K]>,
  options: { includeOwn?: boolean } = {}
): void {
  const bus = useEventSurface();
  const panelId = usePanelId();
  const { includeOwn = false } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return bus.on(
      type,
      (payload, record) => handlerRef.current(payload, record),
      includeOwn ? {} : { sourceId: panelId }
    );
  }, [bus, type, panelId, includeOwn]);
}

/**
 * The current payload for `type`, seeded from the queue's latch on mount and
 * kept fresh by a subscription.
 *
 * This is the hook that makes late mounting work: a panel rendered after the
 * video already started still reads the running video immediately, rather than
 * showing empty until the next change that may never come.
 *
 * Own-panel events are excluded by default — an article list does not need to
 * react to its own click broadcast.
 */
export function useLatestEvent<K extends SurfaceEventName<EventSurfaceEventMap>>(
  type: K,
  options: { includeOwn?: boolean } = {}
): EventSurfaceEventMap[K] | undefined {
  const bus = useEventSurface();
  const panelId = usePanelId();
  const { includeOwn = false } = options;

  const [value, setValue] = useState<EventSurfaceEventMap[K] | undefined>(() => {
    const latched = bus.latestRecord(type);
    if (!latched) return undefined;
    if (!includeOwn && latched.sourceId === panelId) return undefined;
    return latched.payload;
  });

  useEffect(() => {
    // Re-seed: the latch may have advanced between the initial render and this
    // effect (a sibling emitting during its own mount, in the same commit).
    const latched = bus.latestRecord(type);
    if (latched && (includeOwn || latched.sourceId !== panelId)) {
      setValue(latched.payload);
    }

    return bus.on(type, (payload) => setValue(payload), includeOwn ? {} : { sourceId: panelId });
  }, [bus, type, panelId, includeOwn]);

  return value;
}

/**
 * Live view of the capture queue, oldest first. Re-renders whenever any event is
 * captured. Intended for debug / audit surfaces — a normal panel should use
 * {@link useLatestEvent} rather than scanning history.
 */
export function useEventHistory<K extends SurfaceEventName<EventSurfaceEventMap>>(
  type?: K
): readonly EventRecord<SurfaceEventName<EventSurfaceEventMap>, unknown>[] {
  const bus = useEventSurface();

  // `history()` allocates a fresh array each call, which would make
  // useSyncExternalStore loop forever on reference inequality. Cache it and only
  // swap when the queue actually advanced (last record id / length differ).
  const snapshotRef = useRef<readonly EventRecord<SurfaceEventName<EventSurfaceEventMap>, unknown>[]>([]);

  const subscribe = useCallback((onStoreChange: () => void) => bus.onAny(() => onStoreChange()), [bus]);

  const getSnapshot = useCallback(() => {
    const next = bus.history(type);
    const previous = snapshotRef.current;
    const advanced = next.length !== previous.length || next[next.length - 1]?.id !== previous[previous.length - 1]?.id;
    if (advanced) snapshotRef.current = next;
    return snapshotRef.current;
  }, [bus, type]);

  // The queue is client-only; on the server there is nothing captured yet.
  const getServerSnapshot = useCallback(() => EMPTY_HISTORY, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Stable empty array so the SSR snapshot never changes identity. */
const EMPTY_HISTORY: readonly EventRecord<SurfaceEventName<EventSurfaceEventMap>, unknown>[] = [];

/** @internal Re-exported so `event-surface.tsx` can read the raw contexts. */
export { EventSurfaceContext, PanelIdContext };
