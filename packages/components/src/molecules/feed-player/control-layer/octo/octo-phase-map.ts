import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";

/** Mirror of the SDK's OctoPhase (the wire contract). Kept local to avoid a cross-package import. */
export type OctoPhase = "idle" | "countdown" | "thinking" | "response" | "collapsed" | "error";

/**
 * The resolved view that should be applied to the sheet for a given lifecycle phase.
 */
export interface PhaseView {
  /** Target sheet state. null = leave the sheet exactly as it is (no change). */
  sheetState: DynamicSheetState | null;
}

/**
 * Mobile: real view transitions per phase. The lifecycle never hides Octo —
 * idle/error leave the sheet untouched so a cancel/error can't collapse the user's view.
 */
export const MOBILE_PHASE_MAP: Record<OctoPhase, PhaseView> = {
  idle: { sheetState: null },
  countdown: { sheetState: null },
  thinking: { sheetState: "expand-view" },
  response: { sheetState: "panel-view" },
  collapsed: { sheetState: "default" },
  error: { sheetState: null },
};

/** Desktop: always full-view for active phases; never shrinks, never hides. */
export const DESKTOP_PHASE_MAP: Record<OctoPhase, PhaseView> = {
  idle: { sheetState: null },
  countdown: { sheetState: "full-view" },
  thinking: { sheetState: "full-view" },
  response: { sheetState: "full-view" },
  collapsed: { sheetState: "full-view" },
  error: { sheetState: null },
};
