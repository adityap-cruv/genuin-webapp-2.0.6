/**
 * Pure logic for the CTA-text-truncation gate.
 *
 * Sibling to `linkout-expand-gate.ts` (same three gated states, same
 * fail-open convention, combined into the same `RevealFits` shape by the
 * host) but answers a different question per state: "would the CTA label
 * render truncated (ellipsis-cut) here?" The CTA must never show truncated
 * text, so a state where it would truncate is not allowed — the host's
 * existing auto-advance/demotion logic (driven by `RevealFits`) then simply
 * never enters it, landing one step lower in the reveal chain instead.
 *
 * Pure (no DOM, no React) — the actual `scrollWidth > clientWidth` truncation
 * check happens once, off-screen, in `linkout-expand-height-well.tsx`; this
 * module only turns that measured boolean into the gate's fits/doesn't-fit verdict.
 */
import type { GatedRevealState, RevealFits } from "./linkout-expand-gate";

/**
 * Decide, per gated state, whether the CTA fits (doesn't truncate) there.
 *
 * ALL three states are gated, including `default`. The product rule is "the CTA
 * must never render truncated": if the CTA would truncate even at the `default`
 * floor (a narrow card where the resolved label — e.g. "Order Now" — overflows
 * the button after the thumbnail/chevron eat the width), `default` doesn't fit
 * either, so the reveal never leaves the chip. The consumers already handle this
 * correctly: the auto-advance check blocks the chip→default hop, and the
 * demotion effect falls back to `baseConfig.initialState` (the chip) when no
 * lower gated state fits.
 *
 * This is safe now that the off-screen well measures the REAL resolved CTA label
 * (`ctaText || title || "Learn more"`), not the long raw title — an earlier bug
 * where the well fell back to a 378px title flagged `default` truncated for every
 * linkout and stranded the reveal at the chip.
 *
 * Fail-open: a state not yet measured (absent from the map) fits — same
 * first-paint convention as `computeRevealGate`.
 */
export function computeCtaFitGate(ctaTruncatedByState: Partial<Record<GatedRevealState, boolean>>): RevealFits {
  const fitsOne = (state: GatedRevealState): boolean => !(ctaTruncatedByState[state] ?? false);
  return {
    default: fitsOne("default"),
    "default-active": fitsOne("default-active"),
    "expand-view": fitsOne("expand-view"),
  };
}
