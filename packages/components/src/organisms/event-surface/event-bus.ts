/**
 * Typed pub/sub bus backing a single EventSurface instance.
 *
 * One bus per mounted surface — never a module singleton — so two surfaces on
 * the same page cannot cross-contaminate each other's state.
 *
 * The two rules that make bidirectional sync safe (video -> article -> video)
 * live here:
 *
 * - **Origin tagging.** Every emit carries the emitting panel's `sourceId`, and
 *   a subscriber registered by panel X is skipped for records X emitted itself.
 *   Without this, a panel that both emits and listens re-enters on its own
 *   broadcast and ping-pongs forever.
 * - **Redundant-emit suppression.** An emit whose payload is structurally equal
 *   to the currently latched value for that type is dropped before it fans out.
 *   Re-broadcasting the already-current active video is a no-op, which cuts the
 *   loop even when two panels legitimately drive the same state.
 *
 * Framework-free on purpose — no React import.
 */

import { DEFAULT_QUEUE_CAPACITY, EventQueue, type EventRecord } from "./event-queue";

/** Receives an event body plus the full record (origin + ordering metadata). */
export type EventHandler<TPayload> = (payload: TPayload, record: EventRecord<string, TPayload>) => void;

/** Options accepted when registering a subscriber. */
export interface SubscribeOptions {
  /**
   * Id of the subscribing panel. Records emitted by this same id are not
   * delivered to this handler (echo suppression). Omit to receive everything,
   * including your own emits — useful for a passive logger/debug panel.
   */
  sourceId?: string;
}

interface Subscription<TPayload> {
  handler: EventHandler<TPayload>;
  sourceId?: string;
}

/**
 * Structural equality for event payloads. Deliberately narrow: payloads on this
 * bus are plain JSON-ish objects of primitives (ids, indices, flags), so a
 * one-level-deep recursive compare is both sufficient and cheap. Functions,
 * Dates, Maps and class instances are compared by reference.
 */
function isSamePayload(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;

  const aIsArray = Array.isArray(a);
  if (aIsArray !== Array.isArray(b)) return false;

  if (aIsArray) {
    const arrayA = a as unknown[];
    const arrayB = b as unknown[];
    if (arrayA.length !== arrayB.length) return false;
    return arrayA.every((item, index) => isSamePayload(item, arrayB[index]));
  }

  const objectA = a as Record<string, unknown>;
  const objectB = b as Record<string, unknown>;
  const keysA = Object.keys(objectA);
  const keysB = Object.keys(objectB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(objectB, key) && isSamePayload(objectA[key], objectB[key])
  );
}

/** Construction options for {@link EventBus}. */
export interface EventBusOptions {
  /** Records retained in the capture queue. Defaults to 50. */
  capacity?: number;
  /**
   * Set `false` to deliver every emit even when the payload is unchanged.
   * Only turn this off when an event is a genuine repeatable signal (a "ping",
   * a re-request) rather than a state broadcast.
   */
  suppressDuplicates?: boolean;
}

/**
 * Per-surface typed event bus with a bounded capture queue.
 *
 * @typeParam TMap - Event map; keys are event names, values are payload shapes.
 */
export class EventBus<TMap extends Record<string, unknown>> {
  /** The capture queue. Exposed so consumers can read history / latched values. */
  readonly queue: EventQueue<TMap>;

  private readonly _subscriptions = new Map<string, Set<Subscription<unknown>>>();
  private readonly _wildcards = new Set<(record: EventRecord<string, unknown>) => void>();
  private readonly _suppressDuplicates: boolean;

  constructor(options: EventBusOptions = {}) {
    this.queue = new EventQueue<TMap>(options.capacity ?? DEFAULT_QUEUE_CAPACITY);
    this._suppressDuplicates = options.suppressDuplicates ?? true;
  }

  /**
   * Subscribe to `type`.
   *
   * @returns An unsubscribe function. Always call it on unmount — a stale
   *   handler holding a captured setState would leak and warn.
   */
  on<K extends Extract<keyof TMap, string>>(
    type: K,
    handler: EventHandler<TMap[K]>,
    options: SubscribeOptions = {}
  ): () => void {
    let set = this._subscriptions.get(type);
    if (!set) {
      set = new Set();
      this._subscriptions.set(type, set);
    }

    const subscription: Subscription<unknown> = {
      handler: handler as EventHandler<unknown>,
      sourceId: options.sourceId,
    };
    set.add(subscription);

    return () => {
      set.delete(subscription);
    };
  }

  /**
   * Subscribe to *every* captured event regardless of type or origin.
   *
   * Deliberately exempt from echo suppression — the use cases are observers
   * (debug logs, analytics forwarders) that must see the complete picture,
   * including a panel's own emits.
   *
   * @returns An unsubscribe function.
   */
  onAny(handler: (record: EventRecord<string, unknown>) => void): () => void {
    this._wildcards.add(handler);
    return () => {
      this._wildcards.delete(handler);
    };
  }

  /**
   * Broadcast `payload` to every subscriber of `type` except the emitter itself.
   *
   * @param sourceId - Id of the emitting panel. Required — this is what makes
   *   echo suppression possible.
   * @returns `true` if the event was captured and dispatched, `false` if it was
   *   dropped as a redundant re-broadcast of the current value.
   */
  emit<K extends Extract<keyof TMap, string>>(type: K, payload: TMap[K], sourceId: string): boolean {
    if (this._suppressDuplicates) {
      const current = this.queue.latest(type);
      if (current && isSamePayload(current.payload, payload)) return false;
    }

    const record = this.queue.push(type, payload, sourceId);

    const set = this._subscriptions.get(type);
    if (set) {
      // Snapshot: a handler may subscribe or unsubscribe during dispatch.
      for (const subscription of Array.from(set)) {
        if (subscription.sourceId !== undefined && subscription.sourceId === sourceId) continue;
        (subscription.handler as EventHandler<TMap[K]>)(payload, record as EventRecord<string, TMap[K]>);
      }
    }

    for (const wildcard of Array.from(this._wildcards)) {
      wildcard(record as EventRecord<string, unknown>);
    }
    return true;
  }

  /** The most recent payload for `type`, or `undefined` if it never fired. */
  latest<K extends Extract<keyof TMap, string>>(type: K): TMap[K] | undefined {
    return this.queue.latest(type)?.payload;
  }

  /** The most recent full record for `type` — payload plus origin and ordering. */
  latestRecord<K extends Extract<keyof TMap, string>>(type: K): EventRecord<K, TMap[K]> | undefined {
    return this.queue.latest(type);
  }

  /** Retained capture history, oldest first; optionally filtered by `type`. */
  history<K extends Extract<keyof TMap, string>>(type?: K) {
    return this.queue.history(type);
  }

  /** Drop all captured history and latched values. Subscribers stay registered. */
  clear(): void {
    this.queue.clear();
  }
}
