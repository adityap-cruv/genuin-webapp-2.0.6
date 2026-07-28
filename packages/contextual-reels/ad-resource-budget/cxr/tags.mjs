// tags.mjs — the CXR tag variations the resource-budget harness scores.
//
// Each entry is one QA tag id representing a distinct ad configuration. The
// harness runs every entry through the same `cxr` budget profile (audio ads are
// not display, so a single profile fits today; split per-variation later if the
// budgets need to diverge). Update the ids here when QA tags rotate.
export const CXR_TAGS = [
  {
    id: "6a3aa78ba0daccfd439648b8",
    variation: "ads-only",
    label: "Ads only (audio ad, no organic video)",
  },
  {
    id: "6a3aa86e4da8cd92d289ccda",
    variation: "video+ad",
    label: "Video + ad config (organic reels with ad slots)",
  },
  {
    id: "6a3ba4395df1fee89bf0b2e7",
    variation: "video-only",
    label: "Video only (organic reels, no ad config)",
  },
];

/**
 * Mount sizes each tag is measured at. Size is an independent axis from the tag
 * config: the runner crosses CXR_SIZES × CXR_TAGS into the full matrix.
 *
 * The size drives the resolved ad layout (resolveAdLayout in src/config.ts):
 *   - 320×50  → L3: compact bar, NO player — the reel video never loads until
 *     the user expands, so the HAI media cost should be far lower.
 *   - 320×100 → L4: banner with a 100px thumbnail player that autoplays the
 *     reel, so the full video/HLS cost lands up front.
 *   - 320×480 → L5: full-height player (the L1 render path) at mobile width —
 *     the heaviest mobile surface, so it bounds the HAI risk for the new size.
 * Measuring all three surfaces the collapsed-vs-banner-vs-tall delta per config.
 */
export const CXR_SIZES = [
  { label: "320x50", width: 320, height: 50 },
  { label: "320x100", width: 320, height: 100 },
  { label: "320x480", width: 320, height: 480 },
];

/** The budget profile every variation is scored against (see scripts/budgets.json). */
export const CXR_PROFILE = "cxr";

/**
 * View modes the harness mounts the tag under. Direct-in-frame is today's
 * default; the iframe mode adds one more same-origin wrapper frame to model a
 * publisher who embeds the ad tag inside their own iframe (a common real-world
 * deployment) rather than mounting it straight into the ad slot's document.
 */
export const CXR_VIEW_MODES = [
  { id: "direct", label: "Mounted directly in ad-frame body (current default)" },
  { id: "iframe", label: "Wrapped in a same-origin publisher iframe" },
];

/**
 * Interaction states the harness measures. Non-interacted matches how Chrome's
 * Heavy Ad Intervention actually evaluates a tag (passive observation only);
 * interacted adds a real expand + swipe gesture to capture the resource cost of
 * a user actually engaging with the unit, which HAI does not gate on today but
 * is still worth tracking (see report.mjs — reported informationally, not gated).
 */
export const CXR_INTERACTION_STATES = [
  { id: "non-interacted", label: "Passive observe only (matches Chrome HAI evaluation)" },
  { id: "interacted", label: "Expand + swipe after initial observe window" },
];
