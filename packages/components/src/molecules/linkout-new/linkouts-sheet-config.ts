import type { DynamicSheetConfig, DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";

export type LinkoutsScenario =
  | "expand-mobile"
  | "expand-desktop-inside"
  | "expand-desktop-outside"
  | "embed-120"
  | "embed-180"
  | "embed-300"
  | "embed-outside-120"
  | "embed-outside-180"
  | "embed-outside-300";

export type LinkoutsConfigParams = {
  view: "embed" | "expand" | "default" | null | undefined;
  isMobile: boolean;
  effectiveVideoWidth: number;
  aspectRatio: string | undefined;
  linkoutPlacement: "inside" | "outside" | undefined;
  linkoutsState: DynamicSheetState;
  layout?: "overlay" | "outside" | null | undefined;
};

export interface LinkoutsConfig {
  scenario: LinkoutsScenario;
  config: Omit<DynamicSheetConfig, "onStateChange" | "onClose">;
  showHeader: boolean;
  className: (state: DynamicSheetState) => string;
  footerClassName: (state: DynamicSheetState) => string;
}

const TRANSITION = "gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:w-full";

function panelFullClassName(state: DynamicSheetState): string {
  return cn(
    TRANSITION,
    state === "panel-view" &&
      "gencl:absolute! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:h-[70vh]! gencl:w-screen! gencl:rounded-t-2xl!  gencl:rounded-b-none!",
    state === "full-view" &&
      "gencl:absolute! gencl:bottom-0! gencl:left-0! gencl:right-0! gencl:w-screen! gencl:rounded-t-2xl!  gencl:rounded-b-none!"
  );
}

function collapsedFooterClassName(state: DynamicSheetState): string {
  return state === "default" || state === "default-active" ? "gencl:border-0" : "";
}

export function getLinkoutsConfig({
  view,
  isMobile,
  effectiveVideoWidth,
  aspectRatio,
  linkoutPlacement,
  linkoutsState,
  layout,
}: LinkoutsConfigParams): LinkoutsConfig {
  const isExpanded = linkoutsState === "full-view" || linkoutsState === "panel-view";
  const theme: "light" | "dark" = isExpanded ? "light" : "dark";

  const scenario: LinkoutsScenario = (() => {
    const isPortrait = aspectRatio === "16:9";

    if (view === "embed" && layout === "overlay") {
      if (effectiveVideoWidth <= 120) return "embed-120";
      if (effectiveVideoWidth > 300 && isPortrait) return "embed-300";
      return "embed-180";
    }

    if (view === "embed" && layout === "outside") {
      if (effectiveVideoWidth <= 120) return "embed-outside-120";
      if (effectiveVideoWidth > 300 && isPortrait) return "embed-outside-300";
      return "embed-outside-180";
    }

    if (isMobile) return "expand-mobile";
    if (linkoutPlacement === "inside") return "expand-desktop-inside";
    return "expand-desktop-outside";
  })();

  switch (scenario) {
    case "expand-mobile":
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["panel-view", "full-view", "expand-view", "default-active", "default"],
          heights: {
            default: "95px",
            "default-active": "117px",
            "expand-view": "212px",
            "panel-view": "70vh",
            "full-view": "100vh",
          },
          autoAdvance: [{ from: "default-active", to: "expand-view", delayMs: 3000 }],
          showClose: true,
          showOverlay: false,
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        className: panelFullClassName,
        footerClassName: collapsedFooterClassName,
      };

    case "expand-desktop-inside":
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["expand-view", "default"],
          heights: { default: "95px", "expand-view": "208px" },
          autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }],
          showClose: true,
          showOverlay: false,
          showIndicator: false,
          showFooter: true,
          theme,
          disableDragAndSwipe: true,
        },
        showHeader: true,
        className: panelFullClassName,
        footerClassName: collapsedFooterClassName,
      };

    case "expand-desktop-outside":
      return {
        scenario,
        config: {
          initialState: "expand-view",
          enabledStates: ["expand-view", "full-view"],
          heights: { "expand-view": "100%", "full-view": "100%" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: true,
          disableDragAndSwipe: true,
          disableAnimation: true,
          theme: "light",
        },
        showHeader: true,
        className: () => "",
        footerClassName: collapsedFooterClassName,
      };

    case "embed-300":
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["expand-view", "default"],
          heights: { default: "95px", "expand-view": "192px" },
          autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }],
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: true,
          // disableDragAndSwipe: true,
          theme,
        },
        showHeader: true,
        className: () => TRANSITION,
        footerClassName: collapsedFooterClassName,
      };

    case "embed-120":
    case "embed-180":
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["default"],
          heights: { default: "38px" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: false,
          theme,
        },
        showHeader: false,
        className: () => TRANSITION,
        footerClassName: collapsedFooterClassName,
      };

    case "embed-outside-300":
      return {
        scenario,
        config: {
          initialState: "expand-view",
          enabledStates: ["expand-view"],
          heights: { "expand-view": "154px" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: true,
          theme: "light",
          disableDragAndSwipe: true,
        },
        showHeader: false,
        className: () => "gencl:w-full gencl:rounded-none!",
        footerClassName: collapsedFooterClassName,
      };

    case "embed-outside-120":
    case "embed-outside-180":
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["default"],
          heights: { default: "38px" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: false,
          theme: "light",
          disableDragAndSwipe: true,
        },
        showHeader: false,
        className: () => "gencl:w-full gencl:rounded-none!",
        footerClassName: collapsedFooterClassName,
      };
  }
}
