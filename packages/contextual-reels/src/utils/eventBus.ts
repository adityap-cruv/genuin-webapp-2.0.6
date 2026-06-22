/**
 * Typed wrapper around `window.dispatchEvent` / `window.addEventListener` for
 * the custom-event vocabulary used by the contextual-reels widget.
 *
 * Reasons we don't expose `CustomEvent` directly:
 *  - keeps every call site honest about the detail shape per event name;
 *  - centralises the event vocabulary so it can be searched / refactored;
 *  - returns an unsubscribe closure instead of forcing callers to retain
 *    handler references for `removeEventListener`.
 */

/**
 * The full set of window-level custom events emitted or consumed by the widget.
 * Detail payload shapes are conservative — match what the existing JSX consumes.
 */
export interface CxrEventMap {
  "video:expand": Record<string, never>;
  "video:collapse": Record<string, never>;
  "genad:destroy": Record<string, never>;
  "genai:onFill": Record<string, never>;
  "genai:onNoFill": Record<string, never>;
  "genai:dataFetching": Record<string, never>;
  "genai:dataReceived": Record<string, never>;
  "genai:chatClosed": { identifier?: string };
  "genai:videoId": { videoId: string };
}

/**
 * Dispatch a typed window custom event. No-op when running outside a browser.
 */
export function dispatchEvent<K extends keyof CxrEventMap>(name: K, detail: CxrEventMap[K]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Subscribe to a typed window custom event.
 *
 * @returns Unsubscribe function. Safe to call multiple times.
 */
export function addEventListener<K extends keyof CxrEventMap>(
  name: K,
  handler: (detail: CxrEventMap[K]) => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const wrapped = (evt: Event): void => {
    const ce = evt as CustomEvent<CxrEventMap[K]>;
    handler(ce.detail);
  };
  window.addEventListener(name, wrapped as EventListener);
  return () => {
    window.removeEventListener(name, wrapped as EventListener);
  };
}
