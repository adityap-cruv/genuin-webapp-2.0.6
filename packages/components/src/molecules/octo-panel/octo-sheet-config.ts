import { cn } from "@genuin/ui/lib/utils";
import type {
  DynamicSheetConfig,
  DynamicSheetState,
} from "@genuin/ui/dynamic-sheet";

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

const TRANSITION =
  "gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:w-full";

function panelFullClassName(state: DynamicSheetState): string {
  const classNames = cn(
    TRANSITION,
    state === "default" && "gencl:bg-transparent! gencl:shadow-none! gencl:rounded-none!",
    state === "default-active" &&
      "gencl:bg-transparent! gencl:shadow-none! gencl:rounded-none!",
    state === "expand-view" &&
      "gencl:bg-transparent! gencl:shadow-none! gencl:rounded-none!",
    state === "panel-view" &&
      "gencl:fixed! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:h-[70vh]! gencl:w-screen! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:z-50! gencl:bg-white!",
    state === "full-view" &&
      "gencl:fixed! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:w-screen! gencl:rounded-t-2xl! gencl:rounded-b-none! gencl:z-50! gencl:bg-white!",
  );

  console.log('[OctoSheetConfig] panelFullClassName for state:', state, 'classes:', classNames);
  return classNames;
}

function collapsedFooterClassName(state: DynamicSheetState): string {
  // Only "default" has no border, all other states including "default-active" get a border
  const className = state === "default" ? "" : "gencl:border-t";
  console.log('[OctoSheetConfig] collapsedFooterClassName for state:', state, 'className:', className || '(none)');
  return className;
}

export function getOctoSheetConfig({
  isMobile,
  octoState,
  viewportHeight,
}: OctoSheetConfigParams): OctoSheetConfig {
  const isPanelOrFullState =
    octoState === "panel-view" || octoState === "full-view";
  const isExpandedState =
    octoState === "expand-view" || isPanelOrFullState;

  console.log('[OctoSheetConfig] Generating config for state:', {
    octoState,
    height: octoState === "default" ? "160px" : octoState === "default-active" ? "220px" : octoState === "expand-view" ? "300px" : "other",
    isPanelOrFullState,
    isExpandedState,
  });

  const autoAdvanceRules: DynamicSheetConfig["autoAdvance"] = (() => {
    switch (octoState) {
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
      enabledStates: [
        "default",
        "default-active",
        "expand-view",
        "panel-view",
        "full-view",
      ],
      heights: {
        default: "160px",
        "default-active": "220px",
        "expand-view": "300px",
        "panel-view": "70vh",
        "full-view": `${viewportHeight}px`,
      },
      autoAdvance: autoAdvanceRules,
      showClose: isExpandedState,
      showOverlay: isPanelOrFullState,
      showIndicator: true,
      navTitle: "Octo GPT",
      theme,
    },
    className: panelFullClassName,
    footerClassName: collapsedFooterClassName,
  };
}
