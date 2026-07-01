import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";

/** Returns true for compact ad layouts that need the compact control bar. */
export function isCompactLayout(adLayout: AdLayoutId): boolean {
  return adLayout === AD_LAYOUT.L3 || adLayout === AD_LAYOUT.L4;
}

/** URL param set by ad-verification crawlers (e.g. `il.advtq=844,10`). */
const AD_VERIFY_PARAM = "il.advtq";

/**
 * Whether the page is being loaded by an ad-verification crawler, detected by
 * the presence of the `il.advtq` URL param. Checks both the current frame and
 * the top frame — cross-origin access to `window.top.location` throws a
 * `SecurityError`, which is swallowed (treated as not present).
 *
 * These crawlers can't unmute, so behaviours that hinge on user audio
 * engagement (mute-passback, unmute-gated experiments) treat them as a plain
 * gated load rather than firing/passing back against them.
 */
export function isAdVerificationCrawler(): boolean {
  if (new URLSearchParams(window.location.search).has(AD_VERIFY_PARAM)) return true;
  try {
    return new URLSearchParams(window.top?.location.search ?? "").has(AD_VERIFY_PARAM);
  } catch {
    return false;
  }
}
