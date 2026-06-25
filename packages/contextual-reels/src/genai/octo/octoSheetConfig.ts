import type { DynamicSheetConfig, DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";

import { AD_LAYOUT, resolveAdLayout, type AdLayoutId } from "@cxr/config";

/** Parameters for {@link getOctoSheetConfig}. */
export interface OctoSheetConfigParams {
  /** Player container size in CSS px. Drives which states are enabled + their heights. */
  dimensions: { width: number; height: number };
  /** Fullscreen unlocks the full state ladder regardless of the embed size. */
  isFullScreen: boolean;
  /** Current sheet state — drives the per-state chrome (theme, close button, autoAdvance). */
  octoState: DynamicSheetState;
}

/** Resolved sheet config + className helpers for a given dimension/state. */
export interface OctoSheetConfig {
  config: Omit<DynamicSheetConfig, "onStateChange" | "onClose">;
  className: (state: DynamicSheetState) => string;
}

const FULL_LADDER: DynamicSheetState[] = ["default", "default-active", "expand-view", "panel-view", "full-view"];

/**
 * Fraction (0–1) of the player container the sheet occupies per state — the
 * single source of truth shared by the sheet's % heights and the player's
 * Instagram-style shrink. Collapsed/overlay states report 0 so the player stays
 * full size and the sheet floats over it; panel/full split the container so the
 * player shrinks to `1 - fraction` above the sheet. Keep these in sync with the
 * `heights` map below (panel 70% → 0.7, full 100% → 1).
 */
const OCTO_STATE_FRACTION: Partial<Record<DynamicSheetState, number>> = {
  default: 0,
  "default-active": 0,
  "expand-view": 0,
  "panel-view": 0.7,
  "full-view": 1,
};

/**
 * Player-shrink fraction for a sheet state. Returns the sheet's share of the
 * container (0–1); the player should occupy the remaining `1 - fraction`.
 *
 * @param state - Current Octo sheet state.
 * @returns Fraction of the container occupied by the sheet (0 = overlay only).
 */
export function octoFractionForState(state: DynamicSheetState): number {
  return OCTO_STATE_FRACTION[state] ?? 0;
}

/**
 * Which states each embed format may reach. Mirrors the web-sdk ladder for the
 * primary banner/fullscreen; the short formats cap lower because a 70% chat
 * panel doesn't fit. Heights for the enabled collapsed states are shared with
 * the web-sdk config (60 / 158 / 280 px); panel/full are sized against the
 * container height at 70% / 100%.
 */
function enabledStatesFor(layoutId: AdLayoutId, isFullScreen: boolean): DynamicSheetState[] {
  if (isFullScreen) return FULL_LADDER;
  switch (layoutId) {
    case AD_LAYOUT.L1:
      return FULL_LADDER;
    case AD_LAYOUT.L2:
    case AD_LAYOUT.L4:
      return ["default", "default-active", "expand-view"];
    case AD_LAYOUT.L3:
      return ["default"];
    default:
      return FULL_LADDER;
  }
}

const TRANSITION = "gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:w-full";

/**
 * ClassName applied to the sheet panel per state. Collapsed states stay
 * transparent so the video shows through; the expanded states pin the sheet to
 * the bottom of the player container (`absolute`, not `fixed`) as a light
 * rounded surface so the chat stays inside the embed/ad slot and the video
 * defers to it (30/70 within the unit). Height is supplied as a % of the player
 * container via the sheet's numeric height config.
 */
function octoPanelClassName(state: DynamicSheetState): string {
  return cn(
    TRANSITION,
    state === "default" && "gencl:shadow-none!",
    state === "default-active" && "gencl:shadow-none!",
    state === "expand-view" && "gencl:shadow-none!",
    state === "panel-view" &&
      "gencl:absolute! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:w-full! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:z-50! gencl:bg-white!",
    state === "full-view" &&
      "gencl:absolute! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:w-full! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:z-50! gencl:bg-white!"
  );
}

/**
 * Resolve the Octo sheet config for a given embed size + current state.
 *
 * Ported 1:1 from the web-sdk `getOctoSheetConfig` (heights, autoAdvance rules,
 * theme, close/overlay/indicator gating, navTitle), with the only addition that
 * the enabled-state ladder is capped for the short ad formats.
 *
 * @param params - {@link OctoSheetConfigParams}
 * @returns {@link OctoSheetConfig}
 */
export function getOctoSheetConfig({ dimensions, isFullScreen, octoState }: OctoSheetConfigParams): OctoSheetConfig {
  const layoutId = resolveAdLayout(dimensions.width, dimensions.height);
  const enabledStates = enabledStatesFor(layoutId, isFullScreen);

  const isPanelOrFullState = octoState === "panel-view" || octoState === "full-view";

  // autoAdvance rules per active state — verbatim from the web-sdk config. A
  // single phase event (e.g. response → panel-view) snaps every lower state up
  // to the target so the sheet climbs the ladder instead of jumping.
  const autoAdvanceRules: DynamicSheetConfig["autoAdvance"] = (() => {
    switch (octoState) {
      case "default-active":
        return [
          { from: "default", to: "default-active", delayMs: 1 },
          { from: "expand-view", to: "default-active", delayMs: 1 },
        ];
      case "expand-view":
        return [
          { from: "default", to: "expand-view", delayMs: 1 },
          { from: "default-active", to: "expand-view", delayMs: 1 },
        ];
      case "panel-view":
        return [
          { from: "default", to: "panel-view", delayMs: 1 },
          { from: "default-active", to: "panel-view", delayMs: 1 },
          { from: "expand-view", to: "panel-view", delayMs: 1 },
        ];
      case "full-view":
        return [
          { from: "default", to: "full-view", delayMs: 1 },
          { from: "default-active", to: "full-view", delayMs: 1 },
          { from: "expand-view", to: "full-view", delayMs: 1 },
          { from: "panel-view", to: "full-view", delayMs: 1 },
        ];
      default:
        return [];
    }
  })();

  const theme: "light" | "dark" = isPanelOrFullState || octoState === "expand-view" ? "light" : "dark";

  return {
    config: {
      initialState: "default",
      enabledStates,
      // Collapsed states use fixed px; expanded states are a percentage of the
      // player container (numeric height = % of containerHeight in DynamicSheet)
      // so the chat occupies 70% / 100% of the embed and the video defers to it.
      heights: {
        default: "60px",
        "default-active": "158px",
        "expand-view": "280px",
        "panel-view": "70%",
        "full-view": "100%",
      },
      autoAdvance: autoAdvanceRules,
      showClose: octoState !== "default",
      showOverlay: isPanelOrFullState,
      showIndicator: false,
      navTitle: octoState !== "default" ? "Octo GPT" : undefined,
      theme,
    },
    className: octoPanelClassName,
  };
}
