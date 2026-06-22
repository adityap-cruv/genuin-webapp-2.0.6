import type { DynamicSheetConfig, DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";

export type LinkoutsScenario =
  | "expand-mobile"
  | "expand-desktop-inside"
  | "expand-desktop-outside"
  // Embed scenarios are width-bucketed per the Figma reference
  // (https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/?node-id=9260-90901):
  // ≤180=xs, <250=sml, <300=default, <400=active, ≥400=expand. Each is
  // a single-state placement (no sheet drag), so the picked variant is
  // the variant the user sees.
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
  // Responsive wide-card scenario (post-detail / ad slots). Single
  // self-contained card that fills its container; adapts to width
  // and height via internal size buckets + orientation. See
  // RESPONSIVE_LINKOUT_PLAN.md.
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
  // Drawer-style detail views: top-rounded only, flush bottom. We
  // deliberately do NOT pin the panel with `position: absolute`
  // here — that removed it from the document flow, which left the
  // sibling carousel dots (rendered below `<LazyDynamicSheet>`)
  // with nowhere to go and stacked under the panel. With the
  // panel staying inline, the dots flow naturally below it.
  if (state === "panel-view" || state === "full-view") {
    // Drawer: 8 px top corners (per Figma 9621:94120 — same radius
    // as the floating-card states), flush bottom edge against the
    // viewport.
    return cn(TRANSITION, "gencl:rounded-t-lg! gencl:rounded-b-none!");
  }
  // Compact embed-style "floating card" states (default,
  // default-active, expand-view): 8 px corners (overrides the
  // dynamic-sheet's default `rounded-2xl`) plus 8 px inset on
  // each side. The inset is applied at the panel level (rather
  // than via host wrapper padding) so it sticks across scenario /
  // state transitions — e.g. the 3 s default-active → expand-view
  // auto-advance keeps the floating gap. Per Figma 9621:94120.
  return cn(TRANSITION, "gencl:rounded-lg!", "gencl:w-[calc(100%_-_16px)]! gencl:mx-2!");
}

/**
 * `full-view` chrome for placement-chip scenarios (`embed-xs` /
 * `embed-sml`). The embed-story harness wraps the linkout slot in a
 * div with `padding: "8px 0 0"` so the floating-card states
 * (`default-active` / `expand-view`) have breathing room above the
 * card body — but that padding leaves a visible 8 px strip above
 * the panel once it reaches `full-view` (the panel's `height: 100%`
 * resolves against the wrapper's *content box*, so it can't cover
 * the padding). Mirror the inverse offset on the panel itself:
 * pull it up 8 px and extend its resolved height by 8 px so it
 * fills the entire embed frame edge-to-edge. `expand-mobile` uses
 * the same `full-view` state but its harness zeroes the wrapper
 * padding, so this compensation lives in the embed-chip scenario
 * callbacks (not in `panelFullClassName`) to avoid double-pulling
 * the mobile panel.
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
 * Panel className for the outside-layout placement (sibling sitting
 * below the player frame). The panel attaches flush at the top
 * (`rounded-t-none!`) and rounds its bottom corners (`rounded-b-lg!`)
 * to match Figma 10076:79915 / 10075:76988. Shared across the
 * `embed-outside-default` / `-active` / `-expand` scenarios so the
 * five identical strings don't drift.
 */
const OUTSIDE_PANEL_CLASS = "gencl:w-full gencl:rounded-t-none! gencl:rounded-b-lg!";

export function getLinkoutsConfig({
  view,
  isMobile,
  effectiveVideoWidth,
  // aspectRatio is kept on the public `LinkoutsConfigParams` type for
  // caller compatibility; the new width-bucketed picker doesn't need
  // it, so we destructure-and-discard.
  aspectRatio: _aspectRatio,
  linkoutPlacement,
  linkoutsState,
  layout,
}: LinkoutsConfigParams): LinkoutsConfig {
  const isExpanded = linkoutsState === "full-view" || linkoutsState === "panel-view";
  const theme: "light" | "dark" = isExpanded ? "light" : "dark";

  const scenario: LinkoutsScenario = (() => {
    // Responsive wide-card layout — fills the host container, adapts
    // its internal layout to the container's size + orientation.
    // Placed first so `view="responsive"` short-circuits the
    // existing embed / expand routing.
    if (view === "responsive") return "responsive";

    // Width-bucketed embed scenarios per the Figma reference. The
    // single-state placement-only scenarios let the variant we pick
    // here be the variant the user sees — no sheet drag, no
    // auto-advance.
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
      // Mobile expand keeps the existing flow `default → default-active
      // → expand-view → panel-view → full-view`. The chip variants
      // (pl-xs / pl-sml) belong to the *embed* scenarios where the
      // host doesn't externally override state — see §A.9.
      //
      // Heights:
      //   default — `"auto"` so the panel hugs the card's measured
      //     content height. The previous fixed `"95px"` was sized
      //     against a card *with* a title (`min-h-16` thumb + 2-line
      //     title + 40 px CTA + 16 px p-2 = ~100 px) and left a
      //     visible 10–20 px gap below the CTA on thumbnail-only
      //     payloads where the card body collapses to 80 px (`min-h-16`
      //     thumb + 16 px p-2). Matching `embed-default` / embed-xs /
      //     embed-sml — all of which also use `"auto"` for `default` —
      //     eliminates the gap and lets the panel grow with the
      //     content (1- vs 2-line title) without bespoke per-payload
      //     heights.
      //   default-active / expand-view — `"auto"` so each fits the
      //     rich card's measured content height (title + description
      //     + chips + CTA, with the card's own 8 px bottom padding
      //     baked in). The dynamic-sheet's `measuredAutoPx` is a
      //     single scalar shared by all `"auto"` states, but these
      //     two states render the same rich body (the auto-advance
      //     default-active → expand-view doesn't change body
      //     content), so sharing one measured height is correct —
      //     not a snap problem.
      //   panel-view — `70vh` (tall sheet stopping below system
      //     chrome).
      //   full-view — `100%` (fills the host container).
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
          autoAdvance: [{ from: "default-active", to: "expand-view", delayMs: 3000 }],
          // Linkouts owns its own header (favicon + title + X) in
          // non-default states. In `default` the linkouts component
          // returns `header={undefined}` and we want no chrome above
          // the card per Figma 8244-20303 — so the dynamic-sheet's
          // auto-header (which would render a bare X) must stay off.
          showClose: false,
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
      // Drag disabled, so the auto-height NaN sentinel never reaches
      // the snap/clamp math. `expand-view` sizes to its content
      // (Figma 8244-20305) — no empty space below the card body.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["expand-view", "default"],
          heights: { default: "95px", "expand-view": "auto" },
          autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }],
          // Linkouts owns its own header X in non-default states; in
          // default the header is suppressed and the dynamic-sheet's
          // auto-X would render a bare X (Figma 8244-20303 calls for
          // no chrome above the collapsed card).
          showClose: false,
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

    // ── Width-bucketed embed scenarios ───────────────────────────
    // Each embed scenario is a single-state placement. There's no
    // sheet drag and no auto-advance — the variant the picker chose
    // based on `effectiveVideoWidth` is the variant the user sees.
    // disableDragAndSwipe is true for all so the chip doesn't react
    // to touchmove events that should bubble to the host carousel.

    case "embed-xs":
      return {
        scenario,
        config: {
          initialState: "pl-xs",
          // Chip starts as `pl-xs` and auto-advances into
          // `default-active` after 3 s. From there the user can drag
          // through the chain — `default-active` ↔ `expand-view` ↔
          // `panel-view` ↔ `full-view`. The chip state acts as a
          // one-way collapse target: drag down deep enough snaps back
          // to `pl-xs`, but there's no indicator on the chip (engine
          // gate excludes `pl-xs` / `pl-sml`) so the user can't drag
          // back up from it. That's the intended UX.
          //
          // `default-active` and `expand-view` render visually
          // distinct bodies (`default-active` = compact thumb + title
          // + CTA, `expand-view` = rich card with description / meta).
          // Both use `"auto"` — the dynamic-sheet's per-state
          // measurement path (`autoHeightProvider` in
          // `linkouts-dynamic.tsx`) mounts each body in a hidden well
          // so the engine resolves a *distinct* pixel height per
          // state. Without that provider the two states would collide
          // on the active body's measurement; with it, each state
          // sizes to its own natural content (no empty space below the
          // rich card in `expand-view`).
          enabledStates: ["pl-xs", "default-active", "expand-view", "panel-view", "full-view"],
          heights: {
            "pl-xs": "32px",
            "default-active": "auto",
            "expand-view": "auto",
            // `panel-view` matches `expand-mobile` at `70vh`; `full-view`
            // stays container-relative (`100%`) so the panel fills the
            // embed frame without overflowing it. The host is required
            // to give the dynamic-sheet's `containerRef` a definite
            // height — `expand-mobile` forces `height: 100%` on its
            // wrapper, and the placement-chip story harness mirrors
            // that pattern.
            "panel-view": "70vh",
            "full-view": "100%",
          },
          // No auto-advance: `embed-xs` is only selected when
          // `effectiveVideoWidth <= 180` (always below the 250 px
          // threshold), so per product rule the chip stays as `pl-xs`
          // until the user drags it open. The chain `pl-xs ↔
          // default-active ↔ expand-view ↔ panel-view ↔ full-view`
          // remains reachable via drag — only the timed advance is
          // suppressed.
          autoAdvance: [],
          showClose: false,
          showOverlay: false,
          // Indicator is true at scenario level for behaviour parity
          // with `embed-default`. The engine suppresses it in the
          // `pl-xs` chip state and only renders it once the
          // auto-advance lands on `default-active`.
          showIndicator: true,
          // Footer reuses the scenario-wide flag; the host
          // suppresses it for the `pl-xs` chip state via
          // `isChipState` and for `default-active` via
          // `isInlineCtaState` (CTA is rendered inside the card).
          showFooter: true,
          theme,
        },
        // Host gates the header off in `pl-xs` (chip state) and
        // renders it for `default-active` (favicon + title + X)
        // to match the `embed-default` / `embed-active` chrome
        // post-auto-advance.
        showHeader: true,
        // Per-state panel chrome: transparent + no rounding while
        // the chip owns its own bg, then full floating-card chrome
        // (rounded-lg, panel bg, 8 px inset) once we transition
        // into `default-active` so the rich card matches the
        // `embed-default` look.
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
          // Chip starts as `pl-sml` and auto-advances into
          // `default-active` after 3 s. From there the user can drag
          // through the chain — `default-active` ↔ `expand-view` ↔
          // `panel-view` ↔ `full-view`. The chip state acts as a
          // one-way collapse target: drag down deep enough snaps back
          // to `pl-sml`, but there's no indicator on the chip (engine
          // gate excludes `pl-xs` / `pl-sml`) so the user can't drag
          // back up from it. That's the intended UX.
          //
          // See `embed-xs` for the rationale: both `default-active`
          // and `expand-view` use `"auto"` and the per-state
          // `autoHeightProvider` in `linkouts-dynamic.tsx` resolves a
          // distinct pixel height per body. `panel-view` matches
          // `expand-mobile` at `70vh`; `full-view` stays container-
          // relative (`100%`) so it fills the embed frame.
          enabledStates: ["pl-sml", "default-active", "expand-view", "panel-view", "full-view"],
          heights: {
            "pl-sml": "40px",
            "default-active": "auto",
            "expand-view": "auto",
            "panel-view": "70vh",
            "full-view": "100%",
          },
          // No auto-advance: `embed-sml` is only selected when
          // `effectiveVideoWidth < 250` (matches the product rule's
          // threshold), so the chip stays as `pl-sml` until the user
          // drags it open. Drag chain still reachable.
          autoAdvance: [],
          showClose: false,
          showOverlay: false,
          // Indicator is true at scenario level for behaviour parity
          // with `embed-default`. The engine suppresses it in the
          // `pl-sml` chip state and only renders it once the
          // auto-advance lands on `default-active`.
          showIndicator: true,
          // Footer reuses the scenario-wide flag; the host
          // suppresses it for the `pl-sml` chip state via
          // `isChipState` and for `default-active` via
          // `isInlineCtaState` (CTA is rendered inside the card).
          showFooter: true,
          theme,
        },
        // Host gates the header off in `pl-sml` (chip state) and
        // renders it for `default-active` (favicon + title + X)
        // to match the `embed-default` / `embed-active` chrome
        // post-auto-advance.
        showHeader: true,
        // Per-state panel chrome: transparent + no rounding while
        // the chip owns its own bg, then full floating-card chrome
        // (rounded-lg, panel bg, 8 px inset) once we transition
        // into `default-active` so the rich card matches the
        // `embed-default` look.
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
      // Medium-width embed: starts at the `default` state and
      // auto-advances to `default-active` after 3 s. From there the
      // user can drag through the full chain — `default-active` ↔
      // `expand-view` ↔ `panel-view` ↔ `full-view`. The `default`
      // state acts as a one-way collapse target (same pattern as the
      // `pl-xs` / `pl-sml` chip states): the engine suppresses the
      // drag indicator in `default` so the user can't drag back up
      // from it.
      //
      // `default` and `default-active` share the same body composite
      // in <LinkCard> (`isDefaultLike`); they differ only in panel
      // chrome — `default-active` adds the sheet header (favicon +
      // title + close + drag pill) above the body, while `default`
      // suppresses it. `expand-view` renders the rich body
      // (description + meta + CTA).
      //
      // `panel-view` matches `expand-mobile` at `70vh`; `full-view`
      // stays container-relative (`100%`) so the panel fills the
      // embed frame without overflowing it.
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
          // Indicator is true at scenario level for behaviour parity
          // with `embed-xs` / `embed-sml`. The engine suppresses it in
          // the `default` state and only renders it once the
          // auto-advance lands on `default-active`.
          showIndicator: true,
          showFooter: true,
          theme,
        },
        showHeader: true,
        // `full-view` gets the placement-chip compensation class so
        // the panel covers the embed harness's 8 px top padding when
        // it reaches the top stop — matching the `embed-xs` /
        // `embed-sml` chrome.
        className: (state) => (state === "full-view" ? PLACEMENT_FULL_VIEW_CLASS : panelFullClassName(state)),
        footerClassName: collapsedFooterClassName,
      };

    case "embed-active":
      // Medium-width embeds: start at the simple `default` row and
      // auto-advance to `expand-view` (rich horizontal card with
      // thumbnail + title + meta) after 3 s. Mirrors the original
      // embed-300 behaviour. The width-bucketed scenario name still
      // matters for analytics / future per-bucket tweaks, but the
      // state machine is the same.
      //
      // `default-active` is also enabled (with auto height) so hosts
      // that drive state externally (e.g. the storybook Dynamic View
      // harness, which maps the 300–399 px width bucket to the
      // active variant per Figma 8249-19818) can transition into it.
      // Production usage doesn't visit this state — the auto-advance
      // jumps default → expand-view directly.
      //
      // All three heights are `"auto"`: the `default` row (Figma
      // 8244-20303) is a single thumbnail+title line with no header,
      // and the expanded card (Figma 8244-20305) is variable based on
      // description / meta presence. Drag/swipe is disabled so the
      // snap math never sees the NaN sentinel.
      return {
        scenario,
        config: {
          initialState: "default",
          enabledStates: ["default", "default-active", "expand-view"],
          heights: {
            default: "auto",
            "default-active": "auto",
            "expand-view": "auto",
          },
          autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }],
          showClose: false,
          showOverlay: false,
          // Visual drag pill on `expand-view` matches Figma 8244-20305
          // (the pill is design chrome — drag is still disabled).
          // The dynamic-sheet hides the pill in `default` state.
          showIndicator: true,
          showFooter: true,
          disableDragAndSwipe: true,
          theme,
        },
        showHeader: true,
        className: panelFullClassName,
        footerClassName: collapsedFooterClassName,
      };

    case "embed-expand":
      // Wide-embed (≥400 px): rich card starts at `expand-view` and
      // the user can drag through the chain — `expand-view` ↔
      // `panel-view` ↔ `full-view`. Without `full-view` in the
      // `enabledStates` chain, the snap math has no upward stop from
      // `panel-view`, so dragging up does nothing (drag indicator
      // still grabs because it's engine-gated on
      // `disableDragAndSwipe` only, not on whether a higher target
      // exists). `full-view` uses `100%` so the panel fills the
      // embed frame; the harness wrapper must have a definite
      // height for this to resolve — see
      // `dynamic-linkout-embed.stories.tsx` `fillFrameHeight`.
      //
      // `default-active` is also enabled (with auto height) so hosts
      // that push the state externally (the mobile-view storybook
      // harness seeds `default-active`; future production callers
      // could too) land on a valid snap target. Without it, the sheet
      // engine's `validInitialState` fallback clamps to the first
      // enabled state (`expand-view`) and renders the panel at the
      // rich card's measured height — while `linkouts-dynamic.tsx`
      // keeps rendering the *compact* `default-active` body based on
      // `linkoutsState`. The visible body underfills the
      // expand-view-sized panel and a ~150 px empty band appears
      // above the carousel-dot strip. Mirrors the inside
      // `embed-active` scenario's `enabledStates`/`heights` shape for
      // parity.
      return {
        scenario,
        config: {
          initialState: "expand-view",
          enabledStates: ["default-active", "expand-view", "panel-view", "full-view"],
          // Auto-height: `default-active` fits the compact LinkCard
          // (Figma 8249-19818 — thumb + title + inline CTA); the
          // dynamic-sheet's `autoHeightProvider` mounts each state's
          // body in a hidden well so the engine resolves a *distinct*
          // pixel height per state (no collision with `expand-view`'s
          // rich body). `expand-view` fits the LinkCard's intrinsic
          // content height (Figma 8244-20305). `panel-view` matches
          // the `expand-mobile` scenario's tall sheet (70vh).
          // `full-view` stays container-relative (`100%`) so the
          // panel fills the embed frame without overflowing it.
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
        // `full-view` gets the placement-chip compensation class so
        // the panel covers the embed harness's 8 px top padding when
        // it reaches the top stop — matching `embed-default` /
        // `embed-xs` / `embed-sml`.
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
      // Medium-width outside-layout embeds — same start-simple-then-
      // auto-expand pattern as the inside embed scenarios. Auto
      // height for both states; drag disabled so snap math doesn't
      // see the NaN sentinel.
      //
      // `default-active` is also enabled (with auto height) so hosts
      // that push the state externally (storybook `DefaultActiveOutside`
      // harness, future production callers driving the variant per
      // width bucket) land on a valid snap target. Without it, the
      // sheet engine falls back to the first enabled state (`default`)
      // and renders the panel without the favicon+title+close header —
      // but `linkouts-dynamic.tsx` keeps rendering that header for
      // `default-active` based on `linkoutsState`, so the panel height
      // (measured from the well-without-header) ends up shorter than
      // the visible content and clips the inline CTA pill at the
      // bottom. Mirrors the inside `embed-active` scenario's
      // `enabledStates`/`heights` shape for parity.
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
        // Per Figma 10075:76988 the outside expand panel renders the
        // header band (favicon + title + close X) above the rich
        // card body. `linkouts-dynamic.tsx` populates `header` with
        // that content when the state isn't `default`.
        showHeader: true,
        className: () => OUTSIDE_PANEL_CLASS,
        footerClassName: collapsedFooterClassName,
      };

    case "responsive":
      // Responsive wide-card layout — single state, fills the host
      // container. Internal layout (size buckets + orientation +
      // default/expand content state) is handled by the
      // `isResponsive` branch in <LinkCard>; this scenario just
      // wires the state machine and suppresses sheet chrome (drag
      // pill / header / footer all live inside the card body).
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
