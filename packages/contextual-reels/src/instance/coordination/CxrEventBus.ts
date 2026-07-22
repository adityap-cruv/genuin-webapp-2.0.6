/**
 * CxrEventBus — typed per-instance event emitter.
 *
 * Replaces the global window-based eventBus for internal CXR widget events,
 * ensuring multiple widget instances on the same page cannot cross-contaminate
 * each other's state.
 */

/** The full set of typed events internal to the CXR widget. */
export interface CxrEventMap {
  "video:expand": Record<string, never>;
  "video:collapse": Record<string, never>;
  "genad:destroy": Record<string, never>;
  "genai:onFill": Record<string, never>;
  "genai:onNoFill": Record<string, never>;
  "genai:videoId": { videoId: string };
  "player:play": Record<string, never>;
  "player:pause": Record<string, never>;
  "mute:unmuted": Record<string, never>;
  "fullscreen:enter": Record<string, never>;
  "fullscreen:exit": Record<string, never>;
  "ad:fill": Record<string, never>;
  "ad:nofill": Record<string, never>;
  /**
   * Request to unmute a specific ad slot as the result of an explicit user
   * gesture. Carries the target slot's `containerId` so that — with multiple
   * ad slots sharing one widget bus — only the slot whose `containerId` matches
   * acts on it. Consumed synchronously inside the gesture call stack by
   * `useGenAdInstance` (the sole owner of `window.GenAd`), keeping the SDK
   * volume/unmute call within the iOS Safari user-gesture window.
   */
  "ad:unmuteRequest": { containerId: string };
  /**
   * Chrome's Heavy Ad Intervention actually removed the ad frame. Carries the diagnostic
   * "why" bundle (browser intervention report + last resource snapshot + widget context)
   * assembled by `useHeavyAdReporter`. Fired once per removal; mirrored to `window.cxr`.
   * Typed loosely here to avoid a monitoring→coordination import cycle — the reporter owns
   * the concrete `AdRemovedPayload` shape.
   */
  "ad:removed": Record<string, unknown>;
}

type Handler<K extends keyof CxrEventMap> = (detail: CxrEventMap[K]) => void;

/** Per-instance typed event emitter — does not touch window or document. */
export class CxrEventBus {
  private readonly _listeners = new Map<string, Set<Handler<keyof CxrEventMap>>>();
  /**
   * Names of events that have fired at least once on this instance. Lets a
   * consumer that mounts AFTER an event fired still observe that it happened —
   * subscriptions only deliver future events, but some state is a one-way latch
   * (e.g. "the user has engaged audio in this widget") that must survive across
   * slide changes, where each slide mounts fresh components on the same bus.
   */
  private readonly _fired = new Set<keyof CxrEventMap>();

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  on<K extends keyof CxrEventMap>(name: K, handler: Handler<K>): () => void {
    if (!this._listeners.has(name)) {
      this._listeners.set(name, new Set());
    }
    const set = this._listeners.get(name)!;
    set.add(handler as Handler<keyof CxrEventMap>);
    return () => {
      set.delete(handler as Handler<keyof CxrEventMap>);
    };
  }

  /**
   * Emit an event to all registered listeners.
   */
  emit<K extends keyof CxrEventMap>(name: K, detail: CxrEventMap[K]): void {
    this._fired.add(name);
    const set = this._listeners.get(name);
    if (!set) return;
    for (const handler of Array.from(set)) {
      (handler as Handler<K>)(detail);
    }
  }

  /**
   * Whether `name` has been emitted at least once on this instance. Use for
   * one-way latches that late-mounting consumers must be able to read.
   */
  hasFired<K extends keyof CxrEventMap>(name: K): boolean {
    return this._fired.has(name);
  }
}
