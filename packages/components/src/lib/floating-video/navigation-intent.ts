import type { MouseEvent as ReactMouseEvent } from "react";

/**
 * Whether a click will navigate the current page, and therefore whether promoting the
 * active video to a floating player is the right response.
 *
 * Rejects everything that leaves the current document standing: modifier and middle clicks
 * (new tab / new window), `target="_blank"`, and any event a nested control already handled
 * — the join and subscribe buttons call `preventDefault()` on their own click, so a pill's
 * join button must not be read as a navigation to the community.
 */
export function isPrimaryNavigationClick(event: ReactMouseEvent<HTMLElement>): boolean {
  if (event.defaultPrevented) return false;
  // `button === 0` is the primary button. Middle-click (1) opens a background tab and never
  // reaches `onClick` in most browsers, but `onAuxClick` shares this handler shape.
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

  const anchor = (event.target as Element | null)?.closest?.("a");
  if (anchor instanceof HTMLAnchorElement && anchor.target && anchor.target !== "_self") return false;

  return true;
}

/**
 * Resolves an href to a same-origin pathname, or null when it would leave the app.
 * A cross-origin destination unloads the document, which no in-page floating player survives.
 */
export function resolveInternalPathname(href: string): string | null {
  if (typeof window === "undefined" || !href) return null;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname;
  } catch {
    return null;
  }
}
