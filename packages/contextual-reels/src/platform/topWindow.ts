/**
 * Helpers for resolving the outermost accessible browser window.
 *
 * When the widget is embedded inside an iframe (the common case for ad slots),
 * we want analytics to attribute events to the parent page when same-origin
 * allows it, but gracefully fall back to the current window when the browser
 * blocks cross-origin access.
 *
 * Mirrors the legacy `services/config.js` helpers verbatim — including the
 * eager module-level resolution that captures `topWindow` and `windowLink`
 * once at load time.
 */

/**
 * Walk up the window hierarchy until either:
 *  - `window.parent === window` (we are at the top), or
 *  - reading `parent.location.href` throws (cross-origin boundary).
 *
 * Returns the last window we could legally access.
 *
 * @param start The window to start walking from. Defaults to the global
 *              `window`. Tests inject stub objects here.
 */
export function getTopWindow(start: Window = window): Window {
  let current: Window = start;
  // Iterative form (vs the legacy recursion) keeps the stack bounded.
  // Behaviour is identical: each iteration probes the parent and bails on throw.

  while (true) {
    try {
      if (current.parent === current) return current;
      // Probing href is what triggers the cross-origin SecurityError.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      current.parent.location.href;
      current = current.parent;
    } catch {
      return current;
    }
  }
}

/**
 * Read `location.href` from the supplied window, returning `undefined` when
 * the access throws (cross-origin) or the window is missing.
 *
 * Passing `undefined` explicitly returns `undefined` (does NOT fall back to
 * the {@link topWindow} singleton). Call without arguments to read from the
 * outermost accessible window.
 */
export function getWindowLink(...args: [win?: Window | undefined]): string | undefined {
  const target = args.length === 0 ? topWindow : args[0];
  if (!target) return undefined;
  try {
    return target.location?.href;
  } catch {
    return undefined;
  }
}

/**
 * Module-level cache of the outermost accessible window. Resolved once at load
 * time to mirror the legacy `services/config.js` behaviour.
 *
 * In a non-browser context (where `window` is undefined) this resolves to
 * `undefined as unknown as Window` — the widget never runs server-side, so
 * this branch is documented but not exercised in tests.
 */
/* c8 ignore next 2 */
export const topWindow: Window =
  typeof window !== "undefined" ? getTopWindow(window) : (undefined as unknown as Window);

/**
 * Module-level cache of the outermost accessible window's `href`. Resolved
 * once at load time alongside {@link topWindow}.
 */
export const windowLink: string | undefined = getWindowLink(topWindow);
