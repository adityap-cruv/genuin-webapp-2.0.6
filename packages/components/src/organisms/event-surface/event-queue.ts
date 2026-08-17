/**
 * Bounded capture queue for the EventSurface bus.
 *
 * Two jobs, deliberately in one place:
 *
 * 1. **History** — a bounded FIFO log of everything that has crossed the bus.
 *    Powers debugging / audit surfaces (the Storybook event-log panel) without
 *    letting a long-lived surface grow unboundedly.
 * 2. **Latch** — the most recent record *per event type*. This is the load-bearing
 *    half: a panel that mounts AFTER an event fired (a lazily rendered article
 *    list, a tab that was closed while the video started) can synchronously ask
 *    "what is playing right now?" instead of waiting for the next emit that may
 *    never come.
 *
 * Framework-free on purpose — no React import, so it can be unit-tested and
 * reused outside a component tree.
 */

/** A single captured event, stamped with its origin and arrival order. */
export interface EventRecord<TType extends string = string, TPayload = unknown> {
  /** Monotonic per-queue identifier. Stable across renders; usable as a React key. */
  id: number;
  /** The event name, e.g. `"video:change"`. */
  type: TType;
  /** The event body. */
  payload: TPayload;
  /**
   * Id of the panel that emitted this. Drives echo suppression — a panel never
   * receives its own broadcasts back.
   */
  sourceId: string;
  /**
   * Arrival order. A monotonic counter, NOT a wall-clock timestamp: ordering
   * stays stable and deterministic in tests, and two events emitted in the same
   * millisecond still compare correctly.
   */
  at: number;
}

/** Default number of records retained before the oldest is evicted. */
export const DEFAULT_QUEUE_CAPACITY = 50;

/**
 * FIFO capture log with a per-type "latest value" latch.
 *
 * @typeParam TMap - The surface's event map; keys are event names, values payloads.
 */
export class EventQueue<TMap extends Record<string, unknown>> {
  private readonly _capacity: number;
  private _records: EventRecord<Extract<keyof TMap, string>, TMap[keyof TMap]>[] = [];
  private readonly _latest = new Map<keyof TMap, EventRecord<Extract<keyof TMap, string>, TMap[keyof TMap]>>();
  /** Feeds both `id` and `at` — one counter keeps them trivially consistent. */
  private _sequence = 0;

  /**
   * @param capacity - Maximum retained records. Values below 1 are clamped to 1;
   *   the latch is unaffected by capacity and always holds every seen type.
   */
  constructor(capacity: number = DEFAULT_QUEUE_CAPACITY) {
    this._capacity = Math.max(1, Math.floor(capacity));
  }

  /**
   * Append an event, evicting the oldest record once capacity is exceeded, and
   * refresh the latch for its type.
   *
   * @returns The stamped record, so the caller can hand it straight to listeners.
   */
  push<K extends Extract<keyof TMap, string>>(type: K, payload: TMap[K], sourceId: string): EventRecord<K, TMap[K]> {
    this._sequence += 1;
    const record: EventRecord<K, TMap[K]> = {
      id: this._sequence,
      type,
      payload,
      sourceId,
      at: this._sequence,
    };

    const stored = record as unknown as EventRecord<Extract<keyof TMap, string>, TMap[keyof TMap]>;
    this._records.push(stored);
    if (this._records.length > this._capacity) {
      this._records = this._records.slice(this._records.length - this._capacity);
    }
    this._latest.set(type, stored);

    return record;
  }

  /**
   * The most recent record of `type`, or `undefined` if it has never fired.
   * Survives capacity eviction — the latch is independent of the history buffer.
   */
  latest<K extends Extract<keyof TMap, string>>(type: K): EventRecord<K, TMap[K]> | undefined {
    return this._latest.get(type) as EventRecord<K, TMap[K]> | undefined;
  }

  /**
   * Retained history, oldest first. Pass `type` to filter to a single event name.
   * Returns a copy — mutating the result cannot corrupt the queue.
   */
  history<K extends Extract<keyof TMap, string>>(
    type?: K
  ): readonly EventRecord<Extract<keyof TMap, string>, TMap[keyof TMap]>[] {
    if (type === undefined) return [...this._records];
    return this._records.filter((record) => record.type === type);
  }

  /** Whether `type` has fired at least once on this queue. */
  hasFired<K extends Extract<keyof TMap, string>>(type: K): boolean {
    return this._latest.has(type);
  }

  /** Number of records currently retained in history (not the latch). */
  get size(): number {
    return this._records.length;
  }

  /** Drop all history and latched values. */
  clear(): void {
    this._records = [];
    this._latest.clear();
  }
}
