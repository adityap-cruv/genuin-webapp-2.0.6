/**
 * URL sanitizer for click-through anchors.
 *
 * Ad/tag CTA URLs arrive from untrusted feed and ad-SDK payloads and are
 * rendered straight into `<a href>`. Without validation a payload of
 * `javascript:…` or `data:text/html,…` executes in the top page when the user
 * clicks the CTA (a stored-XSS sink). This resolves the URL and returns it only
 * when its protocol is in the navigation allowlist; anything else collapses to
 * a safe no-op (`"#"`) so the anchor renders but navigates nowhere.
 */

/** Protocols allowed for a user-facing click-through link. */
const SAFE_PROTOCOLS = new Set(["https:", "http:", "mailto:", "tel:"]);

/** Inert href used when the input cannot be proven safe. */
const UNSAFE_FALLBACK = "#";

/**
 * Return `url` unchanged when it parses to an allowed protocol, otherwise `"#"`.
 *
 * Protocol-relative (`//host`) and site-relative URLs resolve against the
 * current page origin, so they inherit its (http/https) protocol and pass.
 * `javascript:`, `data:`, `vbscript:`, `file:` and any unparseable value are
 * rejected.
 *
 * @param url  The candidate click-through URL from untrusted ad/feed data.
 * @returns A safe href string — the original URL, or `"#"` when unsafe/empty.
 */
export function safeHref(url: string | null | undefined): string {
  if (!url) return UNSAFE_FALLBACK;
  const base = typeof window !== "undefined" ? window.location.href : undefined;
  try {
    const parsed = new URL(url, base);
    return SAFE_PROTOCOLS.has(parsed.protocol) ? url : UNSAFE_FALLBACK;
  } catch {
    return UNSAFE_FALLBACK;
  }
}
