import { CHUNK_LOADERS, type ChunkName } from "./chunk-loaders";

type ChunkLoaders = Record<ChunkName, () => Promise<unknown>>;
/** Schedules `cb` to run when the main thread is idle. Returns nothing. */
type IdleScheduler = (cb: () => void) => void;

/**
 * Default idle scheduler: `requestIdleCallback` when available (so prefetching never
 * competes with the active render or the user's current network activity), falling
 * back to a short `setTimeout`. SSR-safe — if there is no window the callback is
 * dropped (prefetch is best-effort and only meaningful in the browser).
 *
 * The `timeout: 2000` is critical: on a busy host page the browser may never report a
 * truly idle period, so a bare `requestIdleCallback` can be STARVED indefinitely and
 * the prefetch never runs (observed in production — prefetch fired on first load but
 * not on contended refreshes). The timeout forces the callback to run within 2s even
 * if no idle slot appears, so prefetch always proceeds eventually.
 */
const defaultIdleScheduler: IdleScheduler = (cb) => {
  if (typeof window === "undefined") return;
  const ric = (
    window as unknown as { requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number }
  ).requestIdleCallback;
  if (typeof ric === "function") {
    ric(() => cb(), { timeout: 2000 });
  } else {
    window.setTimeout(cb, 200);
  }
};

/**
 * Warms code-split chunks ahead of need, SEQUENTIALLY and in idle time.
 *
 * - One chunk at a time: the next import() only starts after the previous resolves,
 *   so warming follows the parent → child order of the enqueued sequence and never
 *   floods the network with parallel chunk requests.
 * - Idle-scheduled: each step waits for `requestIdleCallback`, so it yields to the
 *   active UI and the user's current interaction.
 * - De-duped: a chunk that has already started loading is never requested again, so
 *   overlapping sequences from different triggers merge into one queue safely.
 * - Best-effort: a failed import() is swallowed and the queue continues — the real
 *   `lazy()` (with its ErrorBoundary) still loads/recovers on actual render.
 *
 * Deps are injectable for testing; production uses the real loaders + idle scheduler.
 */
export class ChunkPrefetcher {
  private readonly loaders: ChunkLoaders;
  private readonly scheduleIdle: IdleScheduler;
  /** Chunks whose loader has already been invoked (in-flight or done). */
  private readonly started = new Set<ChunkName>();
  /** Pending chunks waiting to be warmed, in order. */
  private queue: ChunkName[] = [];
  private running = false;

  constructor(loaders: ChunkLoaders = CHUNK_LOADERS, scheduleIdle: IdleScheduler = defaultIdleScheduler) {
    this.loaders = loaders;
    this.scheduleIdle = scheduleIdle;
  }

  /**
   * Append a sequence to the queue (skipping chunks already started/queued) and kick
   * the loop if idle. Safe to call repeatedly and from many triggers.
   */
  enqueue(sequence: ChunkName[]): void {
    for (const chunk of sequence) {
      if (this.started.has(chunk) || this.queue.includes(chunk)) continue;
      this.queue.push(chunk);
    }
    // eslint-disable-next-line no-console
    console.log("[PREFETCH] enqueue", { sequence, queue: [...this.queue], running: this.running });
    if (!this.running) this.runNext();
  }

  private runNext(): void {
    const chunk = this.queue.shift();
    if (chunk == null) {
      this.running = false;
      return;
    }
    this.running = true;
    // eslint-disable-next-line no-console
    console.log("[PREFETCH] scheduling idle for", chunk);
    this.scheduleIdle(() => {
      // eslint-disable-next-line no-console
      console.log("[PREFETCH] idle fired, loading", chunk);
      // Re-check: another sequence may have started this chunk while we waited.
      if (this.started.has(chunk)) {
        this.runNext();
        return;
      }
      this.started.add(chunk);
      const loader = this.loaders[chunk];
      // Promise.resolve guards against a synchronous throw in the loader thunk.
      Promise.resolve()
        .then(loader)
        .then(() => {
          // eslint-disable-next-line no-console
          console.log("[PREFETCH] loaded", chunk);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.log("[PREFETCH] load FAILED", chunk, e);
        })
        .finally(() => this.runNext());
    });
  }
}

/** Shared singleton used across the app. */
export const chunkPrefetcher = new ChunkPrefetcher();
