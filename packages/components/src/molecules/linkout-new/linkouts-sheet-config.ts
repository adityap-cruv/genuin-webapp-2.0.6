import type { DynamicSheetConfig, DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";

export type LinkoutsScenario =
  | "expand-mobile"
  | "expand-desktop-inside"
  | "expand-desktop-outside"
  // Width-bucketed embed scenarios: ≤180=xs, <250=sml, <300=default,
  // <400=active, ≥400=expand.
  | "embed-xs"
  | "embed-sml"
  | "embed-default"
  | "embed-active"
  | "embed-expand"
  | "embed-outside-xs"
  | "embed-outside-sml"
  | "embed-outside-default"
  | "embed-outside-active"
  | "embed-outside-expand"
  // Responsive wide-card: single self-contained card that fills its
  // container, adapting via internal size buckets + orientation.
  | "responsive";

export type LinkoutsConfigParams = {
  view: "embed" | "expand" | "default" | "responsive" | null | undefined;
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
  // Stays inline (NOT `position: absolute`) so the sibling carousel dots
  // below the sheet have somewhere to flow.
  if (state === "panel-view" || state === "full-view") {
    // Drawer: 8 px top corners, flush bottom against the viewport.
    return cn(TRANSITION, "gencl:rounded-t-lg! gencl:rounded-b-none!");
  }
  // Floating-card states (default / default-active / expand-view): 8 px
  // corners + 8 px side inset. Bottom breathing room is added at the host
  // wrapper (sheet className is unreliable for that in the SDK bundle).
  return cn(TRANSITION, "gencl:rounded-lg!", "gencl:w-[calc(100%_-_16px)]! gencl:mx-2!");
}

/**
 * Panel className for the in-player EXPAND view (`expand-view-details`), whose
 * host already insets the linkout into a 16 px-inset content column beside the
 * actions rail. So the panel fills that column edge-to-edge (no extra side
 * margin) — adding `mx-2` here double-insets it (24 px left + a gap before the
 * rail). Floating-card states keep rounded corners; panel/full stay flush-top.
 */
function expandPanelClassName(state: DynamicSheetState): string {
  if (state === "panel-view" || state === "full-view") {
    return cn(TRANSITION, "gencl:rounded-t-lg! gencl:rounded-b-none!");
  }
  return cn(TRANSITION, "gencl:rounded-lg!");
}

/**
 * `full-view` chrome for placement-chip scenarios. The host wrapper's 8 px
 * top padding leaves a strip above a `height: 100%` panel, so pull the panel
 * up 8 px and extend its height to fill the frame edge-to-edge. Lives here
 * (not `panelFullClassName`) so `expand-mobile`, whose harness zeroes that
 * padding, isn't double-pulled.
 */
const PLACEMENT_FULL_VIEW_CLASS = cn(
  TRANSITION,
  "gencl:rounded-t-lg! gencl:rounded-b-none!",
  "gencl:-mt-2! gencl:h-[calc(100%+8px)]!"
);

function collapsedFooterClassName(state: DynamicSheetState): string {
  return state === "default" || state === "default-active" ? "gencl:border-0" : "";
}

/**
 * Panel className for the outside-layout placement (sibling below the player):
 * flush top, rounded bottom. Shared so the duplicate strings don't drift.
 */
const OUTSIDE_PANEL_CLASS = "gencl:w-full gencl:rounded-t-none! gencl:rounded-b-lg!";

export function getLinkoutsConfig({
  view,
  isMobile,
  effectiveVideoWidth,
  // Kept on the public type for caller compatibility; the width-bucketed
  // picker doesn't use it, so destructure-and-discard.
  aspectRatio: _aspectRatio,
  linkoutPlacement,
  linkoutsState,
  layout,
}: LinkoutsConfigParams): LinkoutsConfig {
  const isExpanded = linkoutsState === "full-view" || linkoutsState === "panel-view";
  const theme: "light" | "dark" = isExpanded ? "light" : "dark";

  const scenario: LinkoutsScenario = (() => {
    // Responsive wide-card short-circuits the embed / expand routing.
    if (view === "responsive") return "responsive";

    // Width-bucketed embed scenarios (single-state, no drag/auto-advance).
    if (view === "embed" && layout === "overlay") {
      if (effectiveVideoWidth <= 180) return "embed-xs";
      if (effectiveVideoWidth < 250) return "embed-sml";
      if (effectiveVideoWidth < 300) return "embed-default";
      if (effectiveVideoWidth < 400) return "embed-active";
      return "embed-expand";
    }

    if (view === "embed" && layout === "outside") {
      if (effectiveVideoWidth <= 180) return "embed-outside-xs";
      if (effectiveVideoWidth < 250) return "embed-outside-sml";
      if (effectiveVideoWidth < 300) return "embed-outside-default";
      if (effectiveVideoWidth < 400) return "embed-outside-active";
      return "embed-outside-expand";
    }

    if (isMobile) return "expand-mobile";
    if (linkoutPlacement === "inside") return "expand-desktop-inside";
    return "expand-desktop-outside";
  })();

  switch (scenario) {
    case "expand-mobile":
      // Flow: default → default-active → expand-view → panel-view → full-view.
      // Heights: default / default-active / expand-view are `"auto"` (panel
      // hugs measured content — a fixed height left a gap on sparse payloads);
      // panel-view `70vh`; full-view `100%`.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["panel-view", "full-view", "expand-view", "default-active", "default"],
          heights: {
            default: "auto",
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70vh",
            "full-view": "100%",
          },
          autoAdvance: [
            // Reveal the chrome shortly after mount, then surface the rich
            // card without user input.
            { from: "default", to: "default-active", delayMs: 1000 },
            { from: "default-active", to: "expand-view", delayMs: 3000 },
          ],
          // Linkouts owns its header in non-default states; keep the sheet's
          // auto-header off so `default` shows no bare X.
          showClose: false,
          showOverlay: false,
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        className: expandPanelClassName,
        footerClassName: collapsedFooterClassName,
      };

    case "expand-desktop-inside":
      // Narrow-desktop overlay (too narrow for the right-rail comments
      // column). Mirrors `expand-mobile`'s drag chain and heights.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["panel-view", "full-view", "expand-view", "default-active", "default"],
          heights: {
            default: "auto",
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70vh",
            "full-view": "100%",
          },
          autoAdvance: [
            { from: "default", to: "default-active", delayMs: 1000 },
            { from: "default-active", to: "expand-view", delayMs: 3000 },
          ],
          // Linkouts owns its header in non-default states; keep the sheet's
          // auto-X off so `default` shows no bare X.
          showClose: false,
          showOverlay: false,
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        className: expandPanelClassName,
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

    // ── Width-bucketed embed scenarios ───────────────────────────
    // Inside-layout: shared drag chain (chip/default → … → full-view),
    // with definite panel/full heights so the snap math has real targets.
    // Outside-layout: single-state, drag disabled.

    case "embed-xs":
      return {
        scenario,
        config: {
          initialState: "pl-xs",
          // Chip is a one-way collapse target: it has no drag indicator, so
          // the user can't drag back up from it (intended UX). The rest of the
          // chain is reachable via drag. `default-active` and `expand-view`
          // both use `"auto"`; the per-state `autoHeightProvider` measures
          // each distinct body so they don't collide on one snap height.
          enabledStates: ["pl-xs", "default-active", "expand-view", "panel-view", "full-view"],
          heights: {
            "pl-xs": "32px",
            "default-active": "auto",
            "expand-view": "auto",
            // panel-view `70vh`; full-view `100%` (host must give containerRef
            // a definite height — the harness forces `height: 100%`).
            "panel-view": "70vh",
            "full-view": "100%",
          },
          // No timed advance below the 250 px threshold; chip stays until
          // dragged open.
          autoAdvance: [],
          showClose: false,
          showOverlay: false,
          // Engine suppresses the indicator in the chip state, shows it once
          // `default-active` is reached.
          showIndicator: true,
          // Host suppresses the footer for the chip and for `default-active`
          // (inline CTA).
          showFooter: true,
          theme,
        },
        // Host gates the header off in the chip state, on for `default-active`.
        showHeader: true,
        // Transparent/no-rounding chip chrome, then full floating-card chrome
        // once in `default-active`.
        className: (state) =>
          state === "pl-xs"
            ? cn(
                TRANSITION,
                "gencl:bg-transparent! gencl:backdrop-blur-none! gencl:rounded-none!",
                "gencl:w-[calc(100%_-_16px)]! gencl:mx-2!"
              )
            : state === "full-view"
              ? PLACEMENT_FULL_VIEW_CLASS
              : panelFullClassName(state),
        footerClassName: collapsedFooterClassName,
      };

    case "embed-sml":
      return {
        scenario,
        config: {
          initialState: "pl-sml",
          // See `embed-xs`: chip is a one-way collapse target (no indicator,
          // can't drag back up); `default-active` / `expand-view` are `"auto"`
          // and measured per-state so they don't collide on one snap height.
          enabledStates: ["pl-sml", "default-active", "expand-view", "panel-view", "full-view"],
          heights: {
            "pl-sml": "40px",
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70vh",
            "full-view": "100%",
          },
          // No timed advance below 250 px; chip stays until dragged open.
          autoAdvance: [],
          showClose: false,
          showOverlay: false,
          // Engine suppresses the indicator in the chip, shows it at
          // `default-active`.
          showIndicator: true,
          // Host suppresses the footer for the chip and `default-active`.
          showFooter: true,
          theme,
        },
        // Host gates the header off in the chip, on for `default-active`.
        showHeader: true,
        // Transparent chip chrome, then full floating-card chrome once active.
        className: (state) =>
          state === "pl-sml"
            ? cn(
                TRANSITION,
                "gencl:bg-transparent! gencl:backdrop-blur-none! gencl:rounded-none!",
                "gencl:w-[calc(100%_-_16px)]! gencl:mx-2!"
              )
            : state === "full-view"
              ? PLACEMENT_FULL_VIEW_CLASS
              : panelFullClassName(state),
        footerClassName: collapsedFooterClassName,
      };

    case "embed-default":
      // Starts at `default` (a one-way collapse target — no indicator) and
      // auto-advances to `default-active`. `default` / `default-active` share
      // the same body and differ only in chrome (header); `expand-view` is
      // the rich body. panel-view `70vh`, full-view `100%`.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["default", "default-active", "expand-view", "panel-view", "full-view"],
          heights: {
            default: "auto",
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70vh",
            "full-view": "100%",
          },
          autoAdvance: [{ from: "default", to: "default-active", delayMs: 3000 }],
          showClose: false,
          showOverlay: false,
          // Engine suppresses the indicator in `default`, shows it at
          // `default-active`.
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        // full-view uses the chip compensation class to cover the harness's
        // 8 px top padding at the top stop.
        className: (state) => (state === "full-view" ? PLACEMENT_FULL_VIEW_CLASS : panelFullClassName(state)),
        footerClassName: collapsedFooterClassName,
      };

    case "embed-active":
      // Starts at `default`, auto-advances to `expand-view`, then drag chain.
      // panel-view is `70%` (not 70vh) so combined with the host's 30% video
      // shrink the two sections tile to exactly 100% — no black gap.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["default", "default-active", "expand-view", "panel-view", "full-view"],
          heights: {
            default: "auto",
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70%",
            "full-view": "100%",
          },
          autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }],
          showClose: false,
          showOverlay: false,
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        className: (state) => (state === "full-view" ? PLACEMENT_FULL_VIEW_CLASS : panelFullClassName(state)),
        footerClassName: collapsedFooterClassName,
      };

    case "embed-expand":
      // Wide embed (≥400 px): starts at `expand-view`, drag chain up to
      // full-view (needed so panel-view has an upward stop; `100%` requires
      // a definite-height wrapper). `default-active` is enabled too so a
      // host that pushes it externally lands on a valid snap target —
      // otherwise the panel sizes to expand-view while the visible body is
      // the compact default-active, leaving an empty band.
      return {
        scenario,
        config: {
          initialState: "expand-view",
          enabledStates: ["default-active", "expand-view", "panel-view", "full-view"],
          // Auto heights for default-active / expand-view (measured per-state
          // by `autoHeightProvider` so they don't collide); panel-view `70vh`,
          // full-view `100%`.
          heights: {
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70vh",
            "full-view": "100%",
          },
          showClose: false,
          showOverlay: false,
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        // full-view uses the chip compensation class to cover the harness's
        // 8 px top padding at the top stop.
        className: (state) => (state === "full-view" ? PLACEMENT_FULL_VIEW_CLASS : panelFullClassName(state)),
        footerClassName: collapsedFooterClassName,
      };

    // ── Outside-layout embed scenarios (light theme, no rounding). ──

    case "embed-outside-xs":
      return {
        scenario,
        config: {
          initialState: "pl-xs",
          enabledStates: ["pl-xs"],
          heights: { "pl-xs": "32px" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: false,
          disableDragAndSwipe: true,
          theme: "light",
        },
        showHeader: false,
        className: () => "gencl:w-full gencl:bg-transparent! gencl:backdrop-blur-none! gencl:rounded-none!",
        footerClassName: collapsedFooterClassName,
      };

    case "embed-outside-sml":
      return {
        scenario,
        config: {
          initialState: "pl-sml",
          enabledStates: ["pl-sml"],
          heights: { "pl-sml": "40px" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: false,
          disableDragAndSwipe: true,
          theme: "light",
        },
        showHeader: false,
        className: () => "gencl:w-full gencl:bg-transparent! gencl:backdrop-blur-none! gencl:rounded-none!",
        footerClassName: collapsedFooterClassName,
      };

    case "embed-outside-default":
    case "embed-outside-active":
      // Outside-layout, same start-simple-then-auto-expand pattern; drag
      // disabled. `default-active` is enabled so a host that pushes it
      // externally lands on a valid snap target — otherwise the panel is
      // measured without the header and clips the inline CTA.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["default", "default-active", "expand-view"],
          heights: { default: "auto", "default-active": "auto", "expand-view": "auto" },
          autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }],
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: true,
          disableDragAndSwipe: true,
          theme: "light",
        },
        showHeader: true,
        className: () => OUTSIDE_PANEL_CLASS,
        footerClassName: collapsedFooterClassName,
      };

    case "embed-outside-expand":
      return {
        scenario,
        config: {
          initialState: "expand-view",
          enabledStates: ["expand-view"],
          heights: { "expand-view": "auto" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: true,
          disableDragAndSwipe: true,
          theme: "light",
        },
        // Outside expand renders the header band above the rich body;
        // `linkouts-dynamic.tsx` fills `header` for non-default states.
        showHeader: true,
        className: () => OUTSIDE_PANEL_CLASS,
        footerClassName: collapsedFooterClassName,
      };

    case "responsive":
      // Single state, fills the host. Internal layout lives in <LinkCard>'s
      // `isResponsive` branch; this just wires the state machine and
      // suppresses all sheet chrome.
      return {
        scenario,
        config: {
          initialState: "responsive",
          enabledStates: ["responsive"],
          heights: { responsive: "100%" },
          showClose: false,
          showOverlay: false,
          showIndicator: false,
          showFooter: false,
          disableDragAndSwipe: true,
          theme: "light",
        },
        showHeader: false,
        className: () => "gencl:w-full gencl:h-full gencl:rounded-none!",
        footerClassName: () => "",
      };
  }
}
