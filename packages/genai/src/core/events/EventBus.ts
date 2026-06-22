import type { EventName, EventPayloads } from './eventRegistry';

/** Function returned from `on` / `once`; invoke to unsubscribe. */
export type Unsubscribe = () => void;

/** Handler signature for a given event name. */
export type EventHandler<K extends EventName> = (payload: EventPayloads[K]) => void;

const hasWindow = (): boolean => typeof window !== 'undefined';

/**
 * Typed wrapper around `window.dispatchEvent` / `window.addEventListener`.
 *
 * - Wire format is unchanged: `CustomEvent<EventPayloads[K]>` on the
 *   browser `window`. External host listeners keep working.
 * - Generic and React-free: no awareness of sessions, panels, or any
 *   consumer. Per-instance filtering is the handler's responsibility.
 * - SSR-safe: every method is a no-op when `window` is undefined.
 */
export class EventBus {
    /**
     * Dispatch `payload` on the global window under the given event name.
     * No-op in non-DOM environments.
     */
    emit<K extends EventName>(name: K, payload: EventPayloads[K]): void {
        if (!hasWindow()) return;
        window.dispatchEvent(new CustomEvent(name, { detail: payload }));
    }

    /**
     * Subscribe to `name`. Returns an unsubscribe closure — this is the only
     * supported way to unsubscribe; retain the returned function and call it.
     * The handler receives the unwrapped `detail` payload — callers never touch
     * the raw `CustomEvent`.
     */
    on<K extends EventName>(name: K, handler: EventHandler<K>): Unsubscribe {
        if (!hasWindow()) return () => undefined;
        const listener = (event: Event): void => {
            // External `new Event(name)` dispatches arrive with `detail: null` (not
            // `undefined`); payload types in `eventRegistry` must allow `null` for
            // any event the bus is meant to receive from external traffic.
            const detail = (event as CustomEvent<EventPayloads[K]>).detail;
            handler(detail);
        };
        window.addEventListener(name, listener);
        return () => window.removeEventListener(name, listener);
    }

    /** Like `on`, but auto-unsubscribes after the first fire. */
    once<K extends EventName>(name: K, handler: EventHandler<K>): Unsubscribe {
        const unsub = this.on(name, payload => {
            unsub();
            handler(payload);
        });
        return unsub;
    }

    /**
     * Resolve with the next payload for `name`. Optional `timeoutMs`
     * rejects the promise if no event arrives in time.
     */
    waitFor<K extends EventName>(name: K, timeoutMs?: number): Promise<EventPayloads[K]> {
        return new Promise<EventPayloads[K]>((resolve, reject) => {
            let timer: ReturnType<typeof setTimeout> | undefined;
            const unsub = this.once(name, payload => {
                if (timer !== undefined) clearTimeout(timer);
                resolve(payload);
            });
            if (typeof timeoutMs === 'number') {
                timer = setTimeout(() => {
                    unsub();
                    reject(new Error(`EventBus.waitFor timed out after ${timeoutMs}ms waiting for "${name}"`));
                }, timeoutMs);
            }
        });
    }
}

/** Module-level singleton. There is exactly one bus per genai bundle. */
export const eventBus = new EventBus();
