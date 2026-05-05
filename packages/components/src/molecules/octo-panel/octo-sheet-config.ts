import type { DynamicSheetConfig, DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";

export interface OctoSheetConfigParams {
  isMobile: boolean;
  octoState: DynamicSheetState;
  viewportHeight: number;
}

export interface OctoSheetConfig {
  config: Omit<DynamicSheetConfig, "onStateChange" | "onClose">;
  className: (state: DynamicSheetState) => string;
  footerClassName: (state: DynamicSheetState) => string;
}

const TRANSITION = "gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:w-full";

function panelFullClassName(state: DynamicSheetState): string {
  return cn(
    TRANSITION,
    state === "default" && "gencl:bg-transparent! gencl:shadow-none!",
    state === "default-active" && "gencl:bg-transparent! gencl:shadow-none!",
    state === "expand-view" && "gencl:bg-transparent! gencl:shadow-none!",
    state === "panel-view" &&
      "gencl:fixed! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:h-[70%]! gencl:w-full! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:z-50! gencl:bg-white!",
    state === "full-view" &&
      "gencl:fixed! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:w-full! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:z-50! gencl:bg-white!"
  );
}

function collapsedFooterClassName(state: DynamicSheetState): string {
  // Only "default" has no border, all other states including "default-active" get a border
  return state === "default" ? "" : "gencl:border-t";
}

export function getOctoSheetConfig({ isMobile, octoState, viewportHeight }: OctoSheetConfigParams): OctoSheetConfig {
  const isPanelOrFullState = octoState === "panel-view" || octoState === "full-view";
  const isExpandedState = octoState === "expand-view" || isPanelOrFullState;

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

  const theme: "light" | "dark" = isPanelOrFullState ? "light" : "dark";

  return {
    config: {
      initialState: "default",
      enabledStates: ["default", "default-active", "expand-view", "panel-view", "full-view"],
      heights: {
        default: "108px",
        "default-active": "178px",
        "expand-view": "280px",
        "panel-view": "70%",
        "full-view": "100%",
      },
      autoAdvance: autoAdvanceRules,
      showClose: isExpandedState,
      showOverlay: isPanelOrFullState,
      showIndicator: false,
      navTitle: "Octo GPT",
      theme,
    },
    className: panelFullClassName,
    footerClassName: collapsedFooterClassName,
  };
}
