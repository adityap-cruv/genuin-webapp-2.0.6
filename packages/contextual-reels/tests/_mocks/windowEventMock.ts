/**
 * `spyOnWindowEvent` — helper that records every dispatch of a window-level
 * custom event so tests can assert on captured detail payloads without juggling
 * raw listeners.
 */

export interface WindowEventSpy<T = unknown> {
  /** Detail payloads captured for every dispatch of the spied event. */
  dispatched: T[];
  /** Programmatic dispatch with type-checked detail. */
  dispatch: (detail: T) => void;
  /** Remove the underlying listener and clear captured data. */
  restore: () => void;
}

export function spyOnWindowEvent<T = unknown>(name: string): WindowEventSpy<T> {
  const dispatched: T[] = [];
  const listener = (evt: Event): void => {
    dispatched.push((evt as CustomEvent<T>).detail);
  };
  window.addEventListener(name, listener as EventListener);
  return {
    dispatched,
    dispatch(detail: T) {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    },
    restore() {
      window.removeEventListener(name, listener as EventListener);
      dispatched.length = 0;
    },
  };
}
