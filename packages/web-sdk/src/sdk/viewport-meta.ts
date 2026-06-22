/**
 * The viewport `content` value the SDK enforces on the host page.
 *
 * `maximum-scale=1` + `user-scalable=no` disable the iOS pinch-zoom and, more
 * importantly, the automatic zoom Safari applies when focusing an input — which
 * otherwise shifts the embedded player/sheet layout.
 */
const VIEWPORT_CONTENT = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

/**
 * Ensures the host page has a zoom-disabling viewport meta tag.
 *
 * The SDK renders on the host page (not inside an iframe), so a missing or
 * permissive `<meta name="viewport">` lets mobile Safari auto-zoom when the user
 * taps the chat input, shifting the embedded layout. This guarantees the correct
 * viewport configuration regardless of the host page's own setup:
 *
 * - If a `<meta name="viewport">` already exists, its `content` is overridden
 *   (no duplicate tag is created).
 * - If none exists, one is created and appended to `document.head`.
 *
 * Safe to call on every init — it is idempotent. No-ops during SSR / when there
 * is no `document` (e.g. server-side rendering of the host page).
 */
export function ensureViewportMeta(): void {
  if (typeof document === "undefined") return;

  const existing = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (existing) {
    existing.setAttribute("content", VIEWPORT_CONTENT);
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute("name", "viewport");
  meta.setAttribute("content", VIEWPORT_CONTENT);
  document.head.appendChild(meta);
}
