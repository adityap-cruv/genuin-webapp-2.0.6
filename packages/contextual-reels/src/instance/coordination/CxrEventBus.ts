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
}

type Handler<K extends keyof CxrEventMap> = (detail: CxrEventMap[K]) => void;

/** Per-instance typed event emitter — does not touch window or document. */
export class CxrEventBus {
  private readonly _listeners = new Map<string, Set<Handler<keyof CxrEventMap>>>();

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
    const set = this._listeners.get(name);
    if (!set) return;
    for (const handler of Array.from(set)) {
      (handler as Handler<K>)(detail);
    }
  }
}
