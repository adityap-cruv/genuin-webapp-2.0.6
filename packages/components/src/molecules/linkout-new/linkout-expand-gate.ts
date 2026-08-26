/**
 * Pure logic for the reveal 50%-height gate.
 *
 * The reveal chain grows `pl-sml → default → expand-view` (timed, 3s per hop),
 * with `default-active` as a user-action branch off `default` (hover/tap). Any
 * of the three "card" states — `default`, `default-active`, `expand-view` — can
 * grow tall enough to cover more than half the video frame. This gate answers,
 * per state, "would entering it breach 50% of the frame?" The host consults it
 * before EVERY reveal transition (auto-advance + hover) and blocks the hop when
 * the target doesn't fit. `panel-view` / `full-view` (explicit drag) are never
 * gated.
 *
 * This module is the deterministic core — no DOM, no React — so the threshold
 * math is unit-testable in isolation. The host owns the measurement side
 * effects (the off-screen well for the numerator, `containerSize.height` for the
 * denominator) and feeds the numbers in.
 */

/** The reveal "card" states the gate reasons about (weakest → strongest). */
export const GATED_REVEAL_STATES = ["default", "default-active", "expand-view"] as const;
export type GatedRevealState = (typeof GATED_REVEAL_STATES)[number];

/**
 * Chrome the visible sheet wraps around the measured card BODY but the bare
 * `LinkCard` well doesn't render: the header row (favicon/title, `p-2`). The
 * footer is suppressed in all three states (the CTA is inline in the body), so
 * only the header is added. Approximate — the gate is a binary fits-under-50%
 * check, so a few px of chrome error only matters right at the boundary. Kept
 * per-state so the three can diverge if their headers ever differ materially.
 */
export const REVEAL_PANEL_CHROME_PX: Record<GatedRevealState, number> = {
  default: 36,
  "default-active": 36,
  "expand-view": 36,
};

/** Narrow an arbitrary sheet-state string to a gated reveal state. */
export function isGatedRevealState(state: string): state is GatedRevealState {
  return (GATED_REVEAL_STATES as readonly string[]).includes(state);
}

export interface RevealGateInput {
  /** The gate only applies to the tile reveal + mobile expand (see host). */
  gateApplies: boolean;
  /** Tallest link's measured BODY height per state (px); 0/absent before measured. */
  bodyPxByState: Partial<Record<GatedRevealState, number>>;
  /** Visible video/player frame height (px); 0 before measured. */
  frameHeightPx: number;
  /** Chrome added to each body to approximate its full panel height. */
  chromePxByState?: Record<GatedRevealState, number>;
}

/** Per-state verdict: `true` = entering that state stays within 50% of the frame. */
export type RevealFits = Record<GatedRevealState, boolean>;

/**
 * Decide, per gated state, whether entering it fits under half the frame.
 * Fail-open: returns `true` when the gate doesn't apply, the body isn't measured
 * yet (0), or the frame is unknown (0) — so the reveal is never blocked on first
 * paint before real numbers land.
 */
export function computeRevealGate({
  gateApplies,
  bodyPxByState,
  frameHeightPx,
  chromePxByState = REVEAL_PANEL_CHROME_PX,
}: RevealGateInput): RevealFits {
  const fitsOne = (state: GatedRevealState): boolean => {
    const body = bodyPxByState[state] ?? 0;
    const panelPx = body > 0 ? body + chromePxByState[state] : 0;
    if (!gateApplies || panelPx <= 0 || frameHeightPx <= 0) return true;
    return panelPx <= 0.5 * frameHeightPx;
  };
  return {
    default: fitsOne("default"),
    "default-active": fitsOne("default-active"),
    "expand-view": fitsOne("expand-view"),
  };
}

/**
 * AND-merge several per-state gate verdicts into one: a gated state fits only if
 * it fits in EVERY gate. Lets the host combine independent gates (the 50%-height
 * gate + the CTA-truncation gate, and any future one) without hand-writing the
 * per-state `&&` — every existing consumer keeps reasoning about a single
 * `RevealFits`. Fail-open composes correctly: an all-`true` gate is the identity.
 */
export function combineRevealGates(...gates: RevealFits[]): RevealFits {
  const fitsAll = (state: GatedRevealState): boolean => gates.every((gate) => gate[state]);
  return {
    default: fitsAll("default"),
    "default-active": fitsAll("default-active"),
    "expand-view": fitsAll("expand-view"),
  };
}

/**
 * Whether a proposed transition target is allowed. Ungated states (chips,
 * panel-view, full-view) are always allowed; gated states defer to the verdict.
 */
export function isRevealTargetAllowed(target: string, fits: RevealFits): boolean {
  return isGatedRevealState(target) ? fits[target] : true;
}

/**
 * The enabled-state set the reveal/drag paths reason about. Diverges from the
 * raw set only for gated states that breach 50% — those are dropped so the
 * reveal/drag can't land on them. Chips + panel/full pass through untouched.
 */
export function gateRevealStates<T extends string>(states: T[], fits: RevealFits): T[] {
  return states.filter((state) => isRevealTargetAllowed(state, fits));
}
