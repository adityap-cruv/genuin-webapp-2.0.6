import type {
  DynamicSheetConfig,
  DynamicSheetHeightConfig,
  DynamicSheetState,
  HeightValue,
} from "@genuin/ui/dynamic-sheet";
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
  /**
   * Set when the host wrapper already applies the 8 px horizontal inset
   * itself (e.g. it pads OTHER siblings — description text, stats — that
   * have no inset of their own, so the panel can't rely on its usual
   * self-provided `mx-2`). Defaults to unset/self-inset, which is what
   * hosts like `default-embed.tsx` need (their wrapper is `py-2`-only and
   * has no other sibling relying on it).
   */
  hostHorizontalInset?: boolean;
  /**
   * Linkout is enabled in the tile but DISABLED in expand
   * (`show_linkout_in_expand`/`showLinksInExpand` is false). When true, dragging
   * is disabled on the tile reveal (`disableDragAndSwipe`) so it can't be pulled
   * up into panel/full-view — the states that grow a full panel over the video
   * (and, with the promote blocked in embed-tile, have nowhere to go). The full
   * `enabledStates` are kept (they drive the theme cross-fade); only manual drag
   * is off. Only affects reveal scenarios that have a chip tier.
   */
  disableExpand?: boolean;
};

export interface LinkoutsConfig {
  scenario: LinkoutsScenario;
  config: Omit<DynamicSheetConfig, "onStateChange" | "onClose">;
  showHeader: boolean;
  className: (state: DynamicSheetState) => string;
  footerClassName: (state: DynamicSheetState) => string;
}

const TRANSITION = "gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:w-full";

function panelFullClassName(state: DynamicSheetState, hostHorizontalInset?: boolean): string {
  // Stays inline (NOT `position: absolute`) so the sibling carousel dots
  // below the sheet have somewhere to flow.
  if (state === "panel-view" || state === "full-view") {
    // Drawer: 8 px top corners, flush bottom against the viewport.
    return cn(TRANSITION, "gencl:rounded-t-lg! gencl:rounded-b-none!");
  }
  // Floating-card states (default / default-active / expand-view): 8 px
  // corners + 8 px side inset. Bottom breathing room is added at the host
  // wrapper (sheet className is unreliable for that in the SDK bundle) —
  // unless the host says it already provides the horizontal inset itself
  // (`hostHorizontalInset`), in which case adding our own here would
  // double it.
  return cn(TRANSITION, "gencl:rounded-lg!", !hostHorizontalInset && "gencl:w-[calc(100%_-_16px)]! gencl:mx-2!");
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
 * Panel className for the in-player placement reveal (chip → default →
 * default-active). The chip (`pl-xs` / `pl-sml`) is chrome-less (transparent)
 * with 8 px corners (design); `default` / `default-active` are the floating
 * card; `full-view` uses the top-padding compensation class. Shared across
 * every embed overlay scenario so the reveal renders identically.
 */
function placementRevealClassName(state: DynamicSheetState, hostHorizontalInset?: boolean): string {
  if (state === "pl-xs" || state === "pl-sml") {
    return cn(
      TRANSITION,
      "gencl:bg-transparent! gencl:backdrop-blur-none! gencl:rounded-lg!",
      !hostHorizontalInset && "gencl:w-[calc(100%_-_16px)]! gencl:mx-2!"
    );
  }
  if (state === "full-view") return PLACEMENT_FULL_VIEW_CLASS;
  return panelFullClassName(state, hostHorizontalInset);
}

/**
 * Panel className for the outside-layout placement (sibling below the player):
 * flush top, rounded bottom. Shared so the duplicate strings don't drift.
 */
const OUTSIDE_PANEL_CLASS = "gencl:w-full gencl:rounded-t-none! gencl:rounded-b-lg!";

/**
 * The in-player placement reveal, shared by every scenario that runs the timed
 * `chip → default → expand-view` chain: the five width-bucketed `embed-*`
 * overlay tiers plus `expand-mobile` / `expand-desktop-inside`. They differ only
 * in the chip tier (`pl-xs`/`pl-sml` and its pixel height), the initial state,
 * the `panel-view` height (`70vh`, except `embed-active`'s `70%`), and which
 * panel-chrome resolver they use (`revealClassName` vs `expandPanelClassName`).
 * Everything else — the enabled set, the auto-chain, the flags — is identical,
 * so it lives here once instead of copy-pasted per case.
 */
function makePlacementReveal(
  scenario: LinkoutsScenario,
  opts: {
    /** Chip tier for this width bucket. */
    chip: "pl-xs" | "pl-sml";
    /** Chip snap height in px (32 for `pl-xs`, 40 for `pl-sml`). */
    chipHeightPx: number;
    /** Embed tiers start collapsed at the chip; expand views carry in at `default`. */
    initialState: DynamicSheetState;
    /** `panel-view` snap height — `"70vh"` everywhere except `embed-active`'s `"70%"`. */
    panelHeight: HeightValue;
    /** Panel-chrome resolver: `revealClassName` (embed) or `expandPanelClassName` (expand). */
    className: (state: DynamicSheetState) => string;
    theme: "light" | "dark";
    /**
     * Lock the reveal at the chip — no auto-advance, no drag to
     * default/default-active/expand-view/panel-view/full-view. Used for
     * xsmall tiles (`effectiveVideoWidth < 250`): too narrow for the card
     * states to render usefully, so the chip is the only state on offer.
     */
    chipOnly?: boolean;
  }
): LinkoutsConfig {
  const { chip, chipHeightPx, initialState, panelHeight, className, theme, chipOnly } = opts;
  const heights: DynamicSheetHeightConfig = chipOnly
    ? { [chip]: `${chipHeightPx}px` }
    : {
        [chip]: `${chipHeightPx}px`,
        default: "auto",
        "default-active": "auto",
        "expand-view": "auto",
        "panel-view": panelHeight,
        "full-view": "100%",
      };
  return {
    scenario,
    config: {
      initialState,
      enabledStates: chipOnly ? [chip] : [chip, "default", "default-active", "expand-view", "panel-view", "full-view"],
      heights,
      // Timed auto-chain: chip → default → expand-view (3s per hop). Each hop is
      // gated by the host (blocked if the target would breach 50% of the frame
      // or truncate the CTA). `default` → `default-active` is a user action
      // (hover/tap) — a branch off `default`, NOT part of the auto-chain.
      // Empty when `chipOnly` — the chip never advances.
      autoAdvance: chipOnly
        ? []
        : [
            { from: chip, to: "default", delayMs: 3000 },
            { from: "default", to: "expand-view", delayMs: 3000 },
          ],
      // Linkouts owns its header in non-chip states; the sheet's auto-header
      // stays off so `default` shows no bare X. Engine suppresses the indicator
      // in the chip and reveals it once `default-active` is reached.
      showClose: false,
      showOverlay: false,
      showIndicator: true,
      showFooter: true,
      disableDragAndSwipe: chipOnly,
      theme,
    },
    showHeader: true,
    className,
    footerClassName: collapsedFooterClassName,
  };
}

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
  hostHorizontalInset,
  disableExpand,
}: LinkoutsConfigParams): LinkoutsConfig {
  const revealClassName = (state: DynamicSheetState) => placementRevealClassName(state, hostHorizontalInset);
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
      // Outside: chip / default / default-active only, no expand-view. Wide
      // bucket (≥300) reuses `-active`.
      if (effectiveVideoWidth <= 180) return "embed-outside-xs";
      if (effectiveVideoWidth < 250) return "embed-outside-sml";
      if (effectiveVideoWidth < 300) return "embed-outside-default";
      return "embed-outside-active";
    }

    if (isMobile) return "expand-mobile";
    if (linkoutPlacement === "inside") return "expand-desktop-inside";
    return "expand-desktop-outside";
  })();

  const built: LinkoutsConfig = ((): LinkoutsConfig => {
    switch (scenario) {
      case "expand-mobile":
        // Continuous flow: the expand view runs the SAME reveal machine as the
        // tile and, once a tile HAS run for this video, inherits its carried
        // state via the global bus. But on mobile web `default.tsx` never mounts
        // the `view="embed"` tile at all (it goes straight to `view="expand"`),
        // so there's no tile handoff to inherit from — `initialState` below is
        // the real first-paint state for every mobile video, not just a
        // before-the-bus-has-an-entry fallback. It must start at the chip like
        // the embed tiers do (GEN-10508); starting at `default` skipped the chip
        // outright, and once the bus is stale from that skip, a subsequent
        // video reuses whatever this or the auto-chain left behind instead of
        // ever showing the chip. `default` → `default-active` is a user action
        // (never auto), and manual drag up through expand-view → panel-view →
        // full-view stays enabled. Heights: default / default-active /
        // expand-view are `"auto"` (panel hugs measured content — a fixed height
        // left a gap on sparse payloads); panel-view `70vh`; full-view `100%`.
        return makePlacementReveal(scenario, {
          chip: "pl-sml",
          chipHeightPx: 40,
          initialState: "pl-sml",
          panelHeight: "70vh",
          className: expandPanelClassName,
          theme,
        });

      case "expand-desktop-inside":
        // Narrow-desktop overlay (too narrow for the right-rail comments column).
        // Mirrors `expand-mobile`: same reveal machine, inherits the tile's state
        // via the global bus. Carried `pl-sml`/`default` state wins as usual (see
        // `linkouts-dynamic.tsx`'s `hasExplicitLinkoutsState` check) — `initialState`
        // below only applies on true first mount, before the bus has any "linkouts"
        // entry, and lands there straight on `expand-view` (desktop default) instead
        // of `default`.
        return makePlacementReveal(scenario, {
          chip: "pl-sml",
          chipHeightPx: 40,
          initialState: "expand-view",
          panelHeight: "70vh",
          className: expandPanelClassName,
          theme,
        });

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
        // Placement reveal, timed: chip (`pl-xs`) → 3s → `default` → 3s →
        // `expand-view`, each hop 50%-height-gated by the host. `default` →
        // `default-active` is a user action (hover/tap) branching off `default`.
        // Same chain as `embed-default`; only the chip state (`pl-xs`) and its
        // `32px` height differ (this is the narrowest tier). `default` /
        // `default-active` / `expand-view` use `"auto"`; the per-state
        // `autoHeightProvider` measures each distinct body so they don't collide
        // on one snap height. `embed-xs` is itself always ≤180 px, so this tier
        // is always `chipOnly` — kept as a width check (not a literal `true`) so
        // it stays governed by the same 250 px xsmall threshold as `embed-sml`.
        return makePlacementReveal(scenario, {
          chip: "pl-xs",
          chipHeightPx: 32,
          initialState: "pl-xs",
          panelHeight: "70vh",
          className: revealClassName,
          theme,
          chipOnly: effectiveVideoWidth < 250,
        });

      case "embed-sml":
        // Placement reveal, timed: chip (`pl-sml`) → 3s → `default` → 3s →
        // `expand-view`, each hop 50%-height-gated by the host. `default` →
        // `default-active` is a user action (hover/tap) branching off `default`.
        // Same chain as `embed-default`; only the chip state (`pl-sml`) and its
        // `40px` height differ from the wider tiers. `embed-sml` spans 180-250 px
        // — entirely inside the <250 xsmall threshold — so this tier, too, is
        // always `chipOnly`.
        return makePlacementReveal(scenario, {
          chip: "pl-sml",
          chipHeightPx: 40,
          initialState: "pl-sml",
          panelHeight: "70vh",
          className: revealClassName,
          theme,
          chipOnly: effectiveVideoWidth < 250,
        });

      case "embed-default":
        // Placement reveal, timed: chip (`pl-sml`) → 3s → `default` → 3s →
        // `expand-view`, each hop 50%-height-gated by the host. `default` →
        // `default-active` is a user action (hover/tap) branching off `default`,
        // NOT part of the auto-chain; the two share a body and differ only in
        // chrome (header). panel/full stay enabled for manual drag.
        return makePlacementReveal(scenario, {
          chip: "pl-sml",
          chipHeightPx: 40,
          initialState: "pl-sml",
          panelHeight: "70vh",
          className: revealClassName,
          theme,
        });

      case "embed-active":
        // Placement reveal, timed: chip (`pl-sml`) → 3s → `default` → 3s →
        // `expand-view`, each hop 50%-height-gated. default → default-active is a
        // user-action branch (not auto). panel-view is `70%` (not 70vh) so combined
        // with the host's 30% video shrink the two sections tile to exactly
        // 100% — no black gap.
        return makePlacementReveal(scenario, {
          chip: "pl-sml",
          chipHeightPx: 40,
          initialState: "pl-sml",
          // `70%` (not 70vh): with the host's 30% video shrink the two sections
          // tile to exactly 100%, so there's no black gap.
          panelHeight: "70%",
          className: revealClassName,
          theme,
        });

      case "embed-expand":
        // Wide embed (≥400 px). Placement reveal applies here too (per spec: all
        // in-player views): timed chip (`pl-sml`) → 3s → `default` → 3s →
        // `expand-view`, each hop 50%-height-gated. default → default-active is a
        // user-action branch (not auto). The drag chain (expand/panel/full) stays
        // enabled for manual open (panel-view needs full-view as an upward stop;
        // `100%` requires a definite-height wrapper).
        return makePlacementReveal(scenario, {
          chip: "pl-sml",
          chipHeightPx: 40,
          initialState: "pl-sml",
          panelHeight: "70vh",
          className: revealClassName,
          theme,
        });

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
        // Outside: no expand-view, no auto-advance. Rests at `default`; user tap
        // advances to `default-active` (enabled so the tap has a valid target).
        // Drag disabled.
        return {
          scenario,
          config: {
            initialState: "default",
            enabledStates: ["default", "default-active"],
            heights: { default: "auto", "default-active": "auto" },
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
  })();

  // Linkout disabled in expand: disable dragging so the reveal can't be pulled
  // up into panel/full-view (which grows a full panel over the video and, before
  // the promote block, opened the disabled mobile expand). We keep the full
  // `enabledStates` untouched — they drive the sheet's dark→light theme
  // cross-fade, so removing panel/full turned the resting card's surface white
  // and made its white text invisible. The timed auto-reveal (chip → default →
  // default-active/expand-view) still runs; only manual drag is off. Scoped to
  // reveal scenarios that have a chip tier; single-state desktop/outside
  // scenarios already set `disableDragAndSwipe`.
  if (disableExpand) {
    const states = built.config.enabledStates ?? [];
    const hasChip = states.some((state) => state === "pl-xs" || state === "pl-sml");
    if (hasChip && !built.config.disableDragAndSwipe) {
      return {
        ...built,
        config: { ...built.config, disableDragAndSwipe: true },
      };
    }
  }

  return built;
}
