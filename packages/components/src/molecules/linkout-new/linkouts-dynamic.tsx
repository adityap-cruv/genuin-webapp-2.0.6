"use client";
import { LinkIcon, XIcon } from "@genuin/ui";
import type { SnapPoint } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";
import { lazy, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { useAnalytics } from "@genuin/components/context/analytics/context";
import { useBaseContext } from "@genuin/components/context/base/context";
import type { SheetState } from "@genuin/components/context/base/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { markLinkoutEngaged } from "@genuin/components/molecules/linkout-new/linkout-engagement-marker";
import {
  LinkoutItem,
  LinkoutCarouselDots,
  LinkoutNavButtons,
} from "@genuin/components/molecules/linkout-new/linkout-item";
import { lastResetVideoIdByBus } from "@genuin/components/molecules/linkout-new/linkout-reset-marker";
import { getLinkoutsConfig } from "@genuin/components/molecules/linkout-new/linkouts-sheet-config";
import type { FlexRatio } from "@genuin/components/molecules/linkout-new/responsive-card";
import { LinkoutCTA } from "@genuin/components/molecules/linkouts/linkout-cta";
import type { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import { userSlideNext, userSlidePrev } from "@genuin/components/organisms/player-swiper/swipe-intent";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { findBannerConfigForSize, pickBannerAdSize, type BannerAdSize } from "./banner-ad-picker";
import { LinkCard, hasRichLinkMetadata, type LinkMetaData } from "./link-card";
import {
  computeRevealGate,
  gateRevealStates,
  GATED_REVEAL_STATES,
  isGatedRevealState,
  isRevealTargetAllowed,
  type GatedRevealState,
} from "./linkout-expand-gate";
import { LinkoutExpandHeightWell, type LinkoutWellMeasurement } from "./linkout-expand-height-well";
import { linkoutTransition, type LinkoutState } from "./linkout-state-machine";
import type { LinkoutSlotContent } from "./types";
import { useLinkoutContainerSize } from "./use-linkout-container-size";

// Lazy so @use-gesture stays out of callers that never render the sheet.
const LazySnapSheet = lazy(() =>
  import("@genuin/ui/dynamic-sheet").then((m) => ({
    default: m.SnapSheet,
  }))
);

// Drag-reachable states, ascending. `default` / `default-active` are
// auto-advance intro states (non-drag); chip / responsive are single-snap.
const DRAG_STATES: SheetState[] = ["expand-view", "panel-view", "full-view"];

// Continuous theme cross-fade colours, mixed against `--gn-sheet-progress`
// (0 = expand/dark surface → white text; 1 = panel/light surface → dark text).
// The var is published by SnapSheet (`themeProgress`) every drag frame; it
// defaults to 0 (dark) outside the drag-chain states.
const SHEET_FG_MIX = "color-mix(in srgb, white, var(--gencl-secondary-900) calc(var(--gn-sheet-progress, 0) * 100%))";
const SHEET_PILL_MIX = "color-mix(in srgb, rgba(255,255,255,0.6), #BEC2C7 calc(var(--gn-sheet-progress, 0) * 100%))";

// Close btn corner math (see the `default`-only close btn below). Matches
// `gencl:size-3` (12px) and the panel's own `mx-2` self-inset (8px).
const CLOSE_BTN_HALF_PX = 6;
const PANEL_GAP_PX = 8;

// Map a scenario height ("auto" | "70vh" | "100%" | "95px" | number) to a
// SnapSheet height. `vh` is approximated as container-% (the in-player frame
// is ~viewport-height in the full-screen overlay this targets).
function toSnapHeight(h: unknown): SnapPoint["height"] {
  if (h == null || h === "auto") return "auto";
  if (typeof h === "number") return h;
  const s = String(h);
  if (s.endsWith("vh") || s.endsWith("%")) return `${parseFloat(s)}%`;
  if (s.endsWith("px")) return parseFloat(s);
  return "auto";
}

/**
 * Drag pill that also accepts a tap. Pointer-move still bubbles to the
 * sheet's drag handler; we only treat a near-zero-movement pointerup as a
 * tap (threshold avoids double-firing on drag-end snap). iOS Safari often
 * can't drag far enough to cross the expand/panel midpoint (URL-bar gesture
 * eats upward motion), so tap is the reliable way to advance.
 */
function DragPillTapTarget({ onTap, style }: { onTap: () => void; style?: CSSProperties }) {
  const downRef = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      // `swiper-no-swiping`: stop the outer feed Swiper stealing vertical
      // drags meant for the sheet. Vertical-only hit-area expansion —
      // horizontal `-mx` mis-routed iOS close taps onto the pill.
      className="swiper-no-swiping gencl:shrink-0 gencl:cursor-grab gencl:py-2 gencl:-my-2"
      role="button"
      tabIndex={0}
      aria-label="Expand linkout"
      // iOS Safari hijacks vertical drags as page scroll without
      // `touch-action: none` — the sheet can't follow the move. `style` lets the
      // caller override the py-2/-my-2 hit-area spacing (e.g. exact 4px in panel).
      style={{ touchAction: "none", ...style }}
      onPointerDown={(e) => {
        downRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = downRef.current;
        downRef.current = null;
        if (!start) return;
        const dx = Math.abs(e.clientX - start.x);
        const dy = Math.abs(e.clientY - start.y);
        if (dx <= 5 && dy <= 5) {
          e.stopPropagation();
          onTap();
        }
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        e.stopPropagation();
        onTap();
      }}>
      <div
        style={{
          width: 40,
          height: 4,
          borderRadius: 9999,
          // Continuously mixed against the drag progress (var-driven, no transition).
          backgroundColor: SHEET_PILL_MIX,
        }}
        aria-hidden
      />
    </div>
  );
}

export interface DynamicLinkoutsProps {
  links: LinkData[];
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  view?: "embed" | "expand" | "default" | "responsive" | null | undefined;
  layout?: "overlay" | "outside" | null | undefined;
  /** Forwarded to `getLinkoutsConfig` — set when the host wrapper already applies
   *  the 8 px horizontal inset itself (it pads other siblings with no inset of
   *  their own), so the panel skips its usual self-provided `mx-2`. */
  hostHorizontalInset?: boolean;
  /** For `view="responsive"`: `"default"` hides description + chips,
   *  `"expand"` shows everything. */
  responsiveState?: "default" | "expand";
  analyticsEventData: ReturnType<typeof buildLinkoutsAnalyticsData>;
  onSwiperToggle?: (isOpen: boolean) => void;
  /** Override effectiveVideoWidth from embed context. Used in Storybook/testing, and in
   *  production by hosts (e.g. the webapp) that don't run inside an `EmbedProvider` —
   *  there `useEmbedConfigs().responsive.effectiveVideoWidth` is always 0. */
  effectiveVideoWidth?: number;
  /** Override aspect ratio from embed context. Used in Storybook/testing (e.g. "16:9"). */
  aspectRatio?: string;
  /** Override the reveal gate's frame-height denominator from embed context. Same
   *  webapp caveat as `effectiveVideoWidth` — `useEmbedConfigs().responsive.containerHeight`
   *  is always 0 there, which fails the 50% gate open (see `computeRevealGate`). */
  containerHeight?: number;
  /** Bypass the scenario's time-based auto-advance. Used by the Storybook
   *  Dynamic View harness so the variant is purely width-driven. */
  disableAutoAdvance?: boolean;
  /** Storybook-only debug grid overlay for the responsive card. */
  showResponsiveGrid?: boolean;
  /**
   * What the slot should host. When set, takes precedence over the
   * back-compat `links` / `ctaText` / `ctaLink` shape and can render an
   * IAB banner ad as the no-fill fallback.
   */
  content?: LinkoutSlotContent;
  /**
   * Container size the banner-ad picker reasons about. Host-supplied for
   * slots that auto-fit and measure 0 until filled (bottom-pinned embed);
   * otherwise self-measured. Only consumed in banner-ad mode.
   */
  adContainerSize?: { w: number; h: number };
  /** For `view="responsive"`: pin the wide card's orientation instead of
   *  auto-detecting from aspect ratio. */
  forceOrientation?: "portrait" | "landscape";
  /** For `view="responsive"`: extra classes merged onto the card's CTA pill. */
  ctaClassName?: string;
  /** For `view="responsive"`: override the auto-picked thumb/details flex
   *  ratio (e.g. `{ thumb: 3, details: 1 }` for a 75/25 split). */
  forceFlexRatio?: FlexRatio;
  /** For `view="responsive"`: skip the thumb/image area when a separate
   *  preview is composed above the card. */
  hideThumb?: boolean;
  /** Active video id. Drives the "global per video" reveal reset: the reveal
   *  restarts at the chip only when a genuinely new video becomes active, so
   *  returning from expand to the same video keeps its state. */
  videoId?: string;
}

export function DynamicLinkouts({
  links,
  ctaText,
  ctaLink,
  isActive,
  view,
  layout,
  hostHorizontalInset,
  analyticsEventData,
  onSwiperToggle,
  effectiveVideoWidth: effectiveVideoWidthProp,
  aspectRatio: aspectRatioProp,
  containerHeight: containerHeightProp,
  disableAutoAdvance = false,
  responsiveState = "default",
  showResponsiveGrid = false,
  content,
  adContainerSize,
  forceOrientation,
  ctaClassName,
  forceFlexRatio,
  hideThumb,
  videoId,
}: DynamicLinkoutsProps) {
  // Resolve from the `content` prop or the back-compat link-shape props.
  const resolvedContent: LinkoutSlotContent = useMemo<LinkoutSlotContent>(
    () => content ?? { kind: "link", links, ctaText, ctaLink },
    [content, links, ctaText, ctaLink]
  );
  const isBannerAdMode = resolvedContent.kind === "banner-ad";
  const [currentLinkIdx, setCurrentLinkIdx] = useState(0);
  // Chip title marquee's scroll-pass duration, reported by `<LinkCard>`; `null`
  // when the title fits (no scroll) or hasn't measured yet. Feeds the
  // chip→default auto-advance timer below so it doesn't tear the chip down
  // mid-scroll. See [[project_linkout_marquee_reset_debug]].
  const [chipMarqueeDurationMs, setChipMarqueeDurationMs] = useState<number | null>(null);
  const { track, EventName } = useAnalytics();
  // Stable, per-SDK-instance bus — used only as the WeakMap key that persists
  // the reveal-reset marker across the tile's expand-close remount.
  const { baseEventBus, brandDetails } = useBaseContext();
  const {
    hasContentType,
    getContentTypeState,
    setContentTypeState,
    toggleContentType,
    closeContentType,
    sheetContentPlacements,
    sheetContentStates,
  } = useSheetState();

  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const {
    responsive: {
      effectiveVideoWidth: contextVideoWidth,
      containerHeight: contextFrameHeightPx,
      headerHeight: contextHeaderHeight,
    },
    dimensions: { aspectRatio: contextAspectRatio },
    links: linksConfig,
  } = useEmbedConfigs();
  const effectiveVideoWidth = effectiveVideoWidthProp ?? contextVideoWidth;
  const aspectRatio = aspectRatioProp ?? contextAspectRatio;
  // Linkout enabled in the tile but off in expand: drop panel/full drag targets
  // from the tile reveal so it can't grow a full panel over the video (see
  // getLinkoutsConfig; the embed-tile promote is blocked for this config too).
  const disableExpand = !linksConfig.showLinksInExpand;
  // 50%-gate denominator = the real VIDEO frame, so the header (feed/carousel
  // title bar above the video) must not count. The context container height
  // includes it; subtract the shared `headerHeight` (0 when no header renders,
  // so this is a no-op when absent). The explicit `containerHeightProp` (webapp,
  // which has no embed header context) is trusted as the frame height as-is.
  const frameHeightPx = containerHeightProp ?? Math.max(0, contextFrameHeightPx - (contextHeaderHeight ?? 0));
  const rawLinkoutsState = getContentTypeState("linkouts");
  const linkoutPlacement = sheetContentPlacements["linkouts"];
  // Memoize so `config` references stay stable; a fresh object each render
  // invalidated the sheet's downstream useMemos (snap math, height bounds).
  const {
    scenario,
    config: baseConfig,
    showHeader,
    className,
    footerClassName,
  } = useMemo(
    () =>
      getLinkoutsConfig({
        view,
        isMobile,
        effectiveVideoWidth,
        aspectRatio: aspectRatio ?? "16:9",
        linkoutPlacement,
        linkoutsState: rawLinkoutsState,
        layout,
        hostHorizontalInset,
        disableExpand,
      }),
    [
      view,
      isMobile,
      effectiveVideoWidth,
      aspectRatio,
      linkoutPlacement,
      rawLinkoutsState,
      layout,
      hostHorizontalInset,
      disableExpand,
    ]
  );
  // DynamicSheet only fires `onStateChange` on transitions, never pushing its
  // `initialState` on mount — so before anything is set the event bus has no
  // "linkouts" entry and we fall back to the scenario's initial state to bridge
  // that gap. Detect "unset" by the ABSENCE of the key (not by value==="default")
  // — otherwise a real transition INTO `default` (SS2 of the placement reveal,
  // whose initialState is the `pl-sml` chip) is misread as unset and snaps back
  // to the chip, freezing the reveal at SS1. Banner-ad mode locks to `default`.
  const hasExplicitLinkoutsState = sheetContentStates["linkouts"] !== undefined;
  const linkoutsState: SheetState = isBannerAdMode
    ? "default"
    : hasExplicitLinkoutsState
      ? rawLinkoutsState
      : (baseConfig.initialState ?? "default");

  // Prefer the host-supplied size (reliable when the slot auto-fits and
  // measures 0 until filled); fall back to self-measurement.
  const { ref: linkoutContainerRef, size: linkoutContainerSize } = useLinkoutContainerSize();
  const resolvedAdContainerSize = adContainerSize ?? linkoutContainerSize;
  // The `<LinkoutItem>` wrapper pads the banner 4 px each side; subtract it
  // from the usable width before picking. Height keeps its own min guard.
  const BANNER_SHEET_CHROME_WIDTH = 8;
  const pickedBannerSize: BannerAdSize | null = isBannerAdMode
    ? pickBannerAdSize(Math.max(0, resolvedAdContainerSize.w - BANNER_SHEET_CHROME_WIDTH), resolvedAdContainerSize.h)
    : null;
  const pickedBannerConfig =
    isBannerAdMode && resolvedContent.kind === "banner-ad" && pickedBannerSize
      ? findBannerConfigForSize(resolvedContent.banner, pickedBannerSize)
      : null;
  // Null config = no eligible ad; the slot stays mounted (ResizeObserver
  // keeps firing) so the picker re-evaluates on resize.
  const hasRenderableAd = isBannerAdMode && pickedBannerConfig !== null;

  // ── State predicates (pure, take a SheetState argument) ─────────────
  // Shared by the visible render and the autoHeightProvider wells so each
  // well renders the same chrome the real panel would. Body-only wells
  // collapse `default` vs `default-active` onto one snap height → drag "blink".
  const isDefaultStateOf = (state: SheetState) => state === "default";
  const isInlineCtaStateOf = (state: SheetState) =>
    state === "default" || state === "default-active" || state === "expand-view";
  const isResponsiveStateOf = (state: SheetState) => state === "responsive";
  const isChipStateOf = (state: SheetState) => state === "pl-xs" || state === "pl-sml";
  const isPanelOrFullStateOf = (state: SheetState) => state === "panel-view" || state === "full-view";
  // Header only for active drawer states — not `default`, `responsive`, or
  // chips. Also honours the scenario's `showHeader` flag.
  const shouldShowHeaderForState = (state: SheetState) =>
    showHeader && !isDefaultStateOf(state) && !isResponsiveStateOf(state) && !isChipStateOf(state);
  // Footer suppressed where the CTA lives inside the body (default /
  // default-active / expand-view), for `responsive`, and for chips.
  const shouldShowFooterForState = (state: SheetState) =>
    !isInlineCtaStateOf(state) && !isResponsiveStateOf(state) && !isChipStateOf(state);

  const isPanelOrFullState = isPanelOrFullStateOf(linkoutsState);

  // Stable px reference for the `%`/`vh` snaps. The player reallocates the
  // linkout's container as the sheet state changes (video shrinks, linkout
  // grows), so resolving `%` against that animating parent shifts the snap
  // targets mid-drag — in expand-view the parent is small, so `full` reads
  // short and an upward drag overshoots it straight to full. The full-screen
  // overlay frame is the viewport, which is stable; pass it for `%` there.
  // Seed synchronously from `window.innerHeight` (not `0`) so `sheetContainerHeight`
  // below is a real px reference on the FIRST render. If it started at 0, the
  // panel/full `%` snaps resolved to 0 at mount, then the post-measure re-render
  // tweened the sheet 0→height — a visible collapse-then-grow jitter as the real
  // sheet replaced the loading skeleton. `DynamicLinkouts` is a lazy client-only
  // chunk (never SSR'd), so reading `window` in the initializer is hydration-safe.
  const [viewportH, setViewportH] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 0));
  useEffect(() => {
    const measure = () => setViewportH(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const sheetContainerHeight = layout === "overlay" ? viewportH || undefined : undefined;

  // ── Snap-point model (replaces the dynamic-sheet scenario state machine) ──
  // SnapSheet measures only the *live* body, so an `"auto"` height is directly
  // known only for the current state. We cache each state's measured height as
  // it's visited (`measuredAuto`) and feed the cached px back as a definite
  // snap — so an off-screen `"auto"` state (e.g. `expand-view` while in
  // panel-view) stays a reachable drag target. The snap set is the current
  // state + every other enabled drag state, using a definite config height, a
  // cached measured height, or skipped if never measured yet.
  const sheetOpen = isActive && hasContentType("linkouts");
  // Stable identity across renders (the `?? []` fallback would mint a new array
  // otherwise) so the gate's memo doesn't invalidate every render.
  const enabledStates = useMemo(() => (baseConfig.enabledStates ?? []) as SheetState[], [baseConfig.enabledStates]);
  const heightsCfg = (baseConfig.heights ?? {}) as Partial<Record<SheetState, unknown>>;
  const [measuredAuto, setMeasuredAuto] = useState<Partial<Record<SheetState, number>>>({});
  const handleAutoMeasure = useCallback((id: string, px: number) => {
    setMeasuredAuto((prev) => (Math.abs((prev[id as SheetState] ?? 0) - px) > 1 ? { ...prev, [id]: px } : prev));
  }, []);

  // ── Reveal 50%-height gate (per-transition) ──────────────────────────────
  // The reveal grows pl-sml→default→expand-view (timed, 3s per hop), with
  // default-active a hover/tap branch off default. Any of the three card states
  // can grow tall enough to cover >50% of the video frame. Before EVERY reveal
  // transition the host checks the target against the gate and blocks the hop
  // when it doesn't fit. Panel/full (explicit drag) are never gated.
  //
  // Scope (see plan-reveal-v2.md, decision D): the tile reveal on mobile+desktop
  // and mobile expand. Desktop expand is a different (right-rail) layout, so it
  // is excluded.
  const isExpandMobile = scenario === "expand-mobile";
  const isEmbedReveal = view === "embed" && layout === "overlay";
  const gateApplies = isEmbedReveal || isExpandMobile;

  // Numerator: tallest link's BODY height per gated state, from the off-screen
  // well. Denominator: the video frame height (`frameHeightPx` = container
  // height minus the header, computed above), reused from embed config's
  // container ResizeObserver — no new observer added here.
  const [revealBodyByState, setRevealBodyByState] = useState<Partial<Record<GatedRevealState, number>>>({});
  const handleRevealMeasure = useCallback((measurement: LinkoutWellMeasurement) => {
    setRevealBodyByState((prev) => {
      const changed = (Object.keys(measurement.bodyPxByState) as GatedRevealState[]).some(
        (s) => Math.abs((prev[s] ?? 0) - measurement.bodyPxByState[s]) > 1
      );
      return changed ? measurement.bodyPxByState : prev;
    });
  }, []);

  // Pure gate math (see linkout-expand-gate.ts). A state is allowed only if it
  // stays under 50% of the frame. (CTA truncation no longer gates anything —
  // a long CTA now marquees in place instead of demoting the state; GEN-10465.)
  // Fail-open until the well and the frame have measured, so the reveal is never
  // blocked on first paint. Memoized so its identity is stable across renders
  // that don't change the inputs — the auto-advance effect depends on it, and a
  // fresh object each render would reset the 3s timer on every re-render
  // (video-time ticks, drag progress, …).
  const revealFits = useMemo(
    () => computeRevealGate({ gateApplies, bodyPxByState: revealBodyByState, frameHeightPx }),
    [gateApplies, revealBodyByState, frameHeightPx]
  );
  // The set the reveal/drag paths reason about. Drops any gated card state that
  // breaches 50%; chips + panel/full pass through untouched. Memoized for the
  // same identity-stability reason (feeds the demotion effect + snap math).
  const effectiveEnabledStates = useMemo(
    () => gateRevealStates(enabledStates, revealFits),
    [enabledStates, revealFits]
  );

  // Safety net for a carried-in / frame-shrunk state that no longer fits: demote
  // to the tallest lower reveal state that still fits. The auto-advance + hover
  // gates prevent entering a too-tall state in the first place; this catches the
  // rest (state carried tile→expand before measurements landed, frame shrink).
  useEffect(() => {
    if (!gateApplies || !isGatedRevealState(linkoutsState) || revealFits[linkoutsState]) return;
    // Weakest → strongest gated reveal order (single source: the gate module).
    const order = [...GATED_REVEAL_STATES];
    const idx = order.indexOf(linkoutsState);
    const lower = order
      .slice(0, idx)
      .reverse()
      .find((s) => effectiveEnabledStates.includes(s));
    // When no lower GATED state fits (e.g. even `default` at idx 0 breaches 50%
    // of a very short frame), drop to the reveal's chip (`pl-*`) rather than
    // `initialState`. For the tile reveal `initialState` IS the chip, so this is a
    // no-op there; for expand scenarios `initialState` is `default`, so falling
    // back to it would be a no-op and leave a too-tall state — the chip is the
    // real floor. Chips are never gated, so a chip in `effectiveEnabledStates`
    // always fits.
    const chip = effectiveEnabledStates.find((s) => s.startsWith("pl-"));
    setContentTypeState("linkouts", lower ?? chip ?? baseConfig.initialState ?? "default");
  }, [gateApplies, revealFits, linkoutsState, effectiveEnabledStates, baseConfig.initialState, setContentTypeState]);
  const currentSnap: SnapPoint = {
    id: linkoutsState,
    height: toSnapHeight(heightsCfg[linkoutsState] ?? "auto"),
  };
  const otherDragSnaps: SnapPoint[] = DRAG_STATES.filter(
    (s) => s !== linkoutsState && effectiveEnabledStates.includes(s)
  )
    .map((s): SnapPoint | null => {
      const h = toSnapHeight(heightsCfg[s]);
      if (h !== "auto") return { id: s, height: h }; // definite (panel/full)
      const cached = measuredAuto[s]; // cached `auto` from a prior visit
      // Fallback estimate when the `auto` height hasn't been measured yet, so
      // the drag chain stays complete (e.g. `expand-view` is reachable below
      // `panel-view` immediately — otherwise the lowest snap is panel and a
      // downward drag rubber-bands with nowhere to land). `onSnap` lands the
      // state and it re-renders at the real measured height.
      return { id: s, height: cached ?? "35%" };
    })
    .filter((p): p is SnapPoint => p != null);
  const snapPoints: SnapPoint[] = [currentSnap, ...otherDragSnaps];
  // Drag is allowed from the drag states AND from the collapsed rest states
  // (`default` / `default-active`) so the pill there actually grows the sheet —
  // acceptance: default-active dragged to panel height ⇒ panel. Chips (`pl-*`)
  // stay one-way (no drag up); banner-ad is locked. Needs ≥2 snaps to move.
  const isDragOrigin =
    DRAG_STATES.includes(linkoutsState) || linkoutsState === "default" || linkoutsState === "default-active";
  const sheetDisabled = isBannerAdMode || !isDragOrigin || snapPoints.length <= 1;

  // Placement reveal flow (SS1 chip → SS2 `default` → SS3 `default-active`):
  // the linkout sheet state is GLOBAL per content type (event bus — see
  // use-sheet-state.ts). The reveal must restart at the chip for a genuinely
  // NEW video, but NOT when the same video re-activates (returning from expand
  // to the tile) — that restart was the "expand → back → pl-sml" bug. So key
  // the reset to `videoId` via the shared state machine, not `isActive`.
  //
  // Fires for the tile reveal (`isEmbedReveal`) AND the mobile expand
  // (`isExpandMobile`). The tile is the reveal host on desktop + websdk; on
  // MOBILE WEBAPP no tile ever mounts (`default.tsx` goes straight to the
  // `view="expand"` `ExpandViewDetails`), so without `isExpandMobile` the
  // per-video restart never ran there — a new video inherited the previous
  // one's carried state off the shared bus instead of starting at the chip.
  // Both hosts start their reveal at the chip (`expand-mobile.initialState` is
  // `pl-sml`), so restarting them identically keeps webapp + websdk in lockstep.
  // The bus-keyed marker map (below) de-dupes when a tile AND an expand instance
  // co-exist for the same video (desktop/websdk), so neither clobbers the other.
  // DESKTOP expand (`expand-desktop-inside/outside`) is intentionally excluded —
  // it carries the tile's state / is a fixed panel, never restarts.
  useEffect(() => {
    if (!isActive || isBannerAdMode || !(isEmbedReveal || isExpandMobile) || !videoId) return;
    // Read the marker from the bus-keyed map, NOT a ref: the tile remounts on
    // expand-close, so a ref would forget we already revealed this video and
    // restart the chip. The map survives the remount → returning to the same
    // video is a no-op (carries the state the user left it in).
    const prev = lastResetVideoIdByBus.get(baseEventBus) ?? null;
    const decided = linkoutTransition(
      { state: linkoutsState as LinkoutState, lastVideoId: prev },
      { type: "ACTIVATE_VIDEO", videoId },
      enabledStates as LinkoutState[]
    );
    lastResetVideoIdByBus.set(baseEventBus, videoId);
    // New video → restart at the scenario's chip (preserves pl-xs vs pl-sml).
    // Same video → no-op (carry). `decided` confirms the reset decision.
    if (prev !== videoId && decided.state !== linkoutsState) {
      setContentTypeState("linkouts", baseConfig.initialState ?? "default");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, videoId]);

  // Panel/full-view are drag-only, so landing there = the user opened it. Mark
  // engaged so the linkout skips the reveal delay on re-activation.
  useEffect(() => {
    if (linkoutsState === "panel-view" || linkoutsState === "full-view") {
      markLinkoutEngaged(baseEventBus, videoId);
    }
  }, [linkoutsState, baseEventBus, videoId]);

  // Time-based auto-advance (e.g. SS1 chip → SS2 `default`), formerly owned by
  // the dynamic-sheet. SnapSheet is pure-controlled, so the host drives it.
  // Off when the host opts out or in banner-ad mode.
  useEffect(() => {
    if (disableAutoAdvance || isBannerAdMode || !sheetOpen) return;
    const rule = (baseConfig.autoAdvance ?? []).find((r) => r.from === linkoutsState);
    if (!rule) return;
    // 50%-height gate: don't auto-advance into a card state that would breach
    // half the frame (e.g. chip→default or default→expand-view on a short tile).
    // Ungated targets (panel/full) always pass. Re-runs when `revealFits`
    // changes (well/frame re-measure), so a hop unblocked later still fires.
    if (!isRevealTargetAllowed(rule.to, revealFits)) return;
    // Chip → default races the chip's own title marquee: a fixed `delayMs`
    // (e.g. 3000ms) tears the chip down mid-scroll for any title whose full
    // pass takes longer, restarting it forever on every re-entry. Wait for
    // at least one full pass. `chipMarqueeDurationMs` is `null` for a title
    // that fits (doesn't scroll) or hasn't reported yet — falls back to the
    // configured delay either way. See [[project_linkout_marquee_reset_debug]].
    const delayMs = rule.from.startsWith("pl-")
      ? Math.max(rule.delayMs ?? 0, chipMarqueeDurationMs ?? 0)
      : rule.delayMs;
    const timer = setTimeout(() => setContentTypeState("linkouts", rule.to), delayMs);
    return () => clearTimeout(timer);
  }, [
    linkoutsState,
    sheetOpen,
    disableAutoAdvance,
    isBannerAdMode,
    baseConfig.autoAdvance,
    revealFits,
    chipMarqueeDurationMs,
    setContentTypeState,
  ]);

  // SS2 → SS3 trigger: advance the resting `default` card to `default-active`
  // (adds the favicon/URL header) on interaction. Tap is the primary trigger
  // (works on touch + desktop); it stops propagation so tapping the linkout
  // advances the reveal instead of bubbling to the tile's open-expand handler.
  // Hover is a desktop-only accelerator. View-AGNOSTIC now (drives the shared
  // machine's USER_ACTION), so `default` → `default-active` fires in the expand
  // view too — previously it was gated to embed and stuck in expand. The
  // reducer no-ops outside `default` / when `default-active` isn't enabled.
  const advanceDefaultToActive = (stopEvent?: () => void) => {
    if (isBannerAdMode) return;
    const next = linkoutTransition(
      // USER_ACTION ignores lastVideoId — pass null.
      { state: linkoutsState as LinkoutState, lastVideoId: null },
      { type: "USER_ACTION" },
      effectiveEnabledStates as LinkoutState[]
    );
    if (next.state === linkoutsState) return;
    stopEvent?.();
    setContentTypeState("linkouts", next.state);
  };

  // Compact header padding (Figma 9621:94871): 8px left/right, 4px top/bottom.
  // Desktop "outside" bumps to `sm:p-3!` for the wider expand layout.
  const headerPaddingClass =
    view === "expand" && isDesktop && sheetContentPlacements["linkouts"] === "outside"
      ? "gencl:sm:p-3!"
      : "gencl:px-2 gencl:py-1";

  const handleSheetClose = () => {
    switch (scenario) {
      case "expand-desktop-inside":
        toggleContentType("linkouts");
        break;
      case "expand-desktop-outside":
        // Close fully — do NOT flip to inside placement, or the in-player
        // overlay starts rendering at the bottom of the video.
        closeContentType("linkouts");
        break;
      default:
        // Targeted close, not `resetSheet()` — that wiped all content types
        // globally and the embed path has no auto-open to bring it back.
        closeContentType("linkouts");
        break;
    }
  };

  // Analytics-only — navigation is performed by each card's native `<a target="_blank">`
  // (see the link cards). Issuing a `window.open` here as well double-opened tabs and, when the
  // URL was empty/undefined, opened a blank `about:blank` tab (the reported bug). It is also
  // unreliable inside the embed's nested iframes, which is why the cards navigate via anchors.
  const handleLinkItemClick = (link: string, title: string) => {
    track(EventName.LINKOUTS_CLICKED, {
      ...analyticsEventData,
      link_url: link,
      link_title: title,
    });
  };

  // Per-link `cta_text` overrides the group-level `ctaText` prop when present
  // (group is never populated in practice — confirmed via live API capture).
  const resolveCtaText = (link?: LinkData) => link?.cta_text || ctaText || link?.title || "Learn more";
  // A link's own URL always wins — the group `ctaLink` (old single-CTA flows:
  // iHeart's KFI injection, `add-linkout` organism) only applies when a link
  // has no URL of its own, so it can never hijack a per-link item's own destination.
  const resolveCtaLink = (link?: LinkData) => link?.link || ctaLink || "";

  const handleCTAClick = () => {
    // CTA click = engagement → skip the reveal delay on re-activation.
    markLinkoutEngaged(baseEventBus, videoId);
    const current = links[currentLinkIdx];
    track(EventName.LINKOUTS_CTA_CLICKED, {
      ...analyticsEventData,
      cta_link: resolveCtaLink(current),
      cta_text: resolveCtaText(current),
    });
  };

  // `responsive` is fully self-contained — all sheet chrome suppressed.
  const isResponsiveState = isResponsiveStateOf(linkoutsState);

  // Header builder, parameterised on state so the autoHeightProvider wells
  // render the same chrome (avoids the default/default-active snap "blink").
  // State only affects favicon, title typography, and close-button presence.
  const renderHeaderForState = (state: SheetState) => {
    const isDefault = isDefaultStateOf(state);
    // Outside card is the white light surface: fixed dark header instead of the
    // overlay's `SHEET_FG_MIX` / white glyph (illegible on white).
    const isOutside = layout === "outside";
    // Panel/full-view: Figma places the drag grabber on its own centred bar
    // ABOVE the title/close row. Other active states keep it inline in the row.
    const isPanelOrFull = isPanelOrFullStateOf(state);
    const dragPill =
      !isDefault && !baseConfig.disableDragAndSwipe ? (
        <DragPillTapTarget
          // Panel/full stacks the grabber above the row: drop the -my-2 pull and
          // use a 4px inset so there's exactly 4px above the bar and 4px to the title.
          style={isPanelOrFull ? { marginTop: 0, marginBottom: 0, paddingTop: 4, paddingBottom: 4 } : undefined}
          onTap={() => {
            const order: SheetState[] = ["default-active", "expand-view", "panel-view", "full-view"];
            const enabled = effectiveEnabledStates.length ? effectiveEnabledStates : order;
            const currentIdx = order.indexOf(linkoutsState);
            const next = order.slice(currentIdx + 1).find((s) => enabled.includes(s));
            if (next) setContentTypeState("linkouts", next);
          }}
        />
      ) : null;
    const headerRow = (
      <div
        className={cn(
          "gencl:w-full gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:rounded-lg gencl:z-[99999]",
          headerPaddingClass,
          // Outside: fixed muted-dark; overlay: drag cross-fade mix (below).
          isOutside && "gencl:text-secondary-700"
        )}
        style={isOutside ? undefined : { color: SHEET_FG_MIX }}
        onClick={(e) => e.stopPropagation()}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:flex-1 gencl:min-w-0">
          {/* 14×14 chain-link glyph — the linkout mark for active-state headers
              (hidden in `default`, title-only). Fixed white stroke instead of
              the FG_MIX text color, which trended too dark to read over the
              video/scrim here. */}
          {!isDefault && (
            <LinkIcon
              className={cn(
                "gencl:size-[12px] gencl:shrink-0",
                isOutside ? "gencl:stroke-secondary-700" : "gencl:stroke-white"
              )}
            />
          )}
          <p
            className={cn(
              "gencl:line-clamp-1 gencl:truncate gencl:flex-1 gencl:min-w-0",
              // default uses a larger title; all active states share the
              // small Body-3 title (prominent typography lives in the body).
              isDefault
                ? "gencl:text-[14px]! gencl:leading-[20px]! gencl:font-semibold!"
                : "gencl:text-[8px]! gencl:leading-[12px]! gencl:font-medium!"
            )}>
            {links[currentLinkIdx]?.title || links[currentLinkIdx]?.link}
          </p>
        </div>
        {/* Inline drag indicator in the top-nav row (replaces the sheet's
            standalone pill, suppressed via `showIndicator: false`). Panel/full
            render the grabber ABOVE the row instead (see below), per Figma. */}
        {!isPanelOrFull && dragPill}
        {/* Close button, right-aligned. Never on the outside card (header stays,
            only the `×` goes). */}
        {!isDefault && layout !== "outside" && (
          <div className="gencl:flex gencl:flex-1 gencl:justify-end gencl:min-w-0">
            <button
              type="button"
              aria-label="Close"
              // Close-button overhang differs by view: the tile insets it 4px
              // (`right: 4`); the expand view pushes it 4px past the card edge
              // (`right: -4`) per design. `position: relative` keeps it in the
              // flex row so the drag pill stays centred against the title.
              style={{ position: "relative", right: view === "expand" ? -4 : 4 }}
              // Stop pointer events so the adjacent pill's tap detector
              // can't read this release as a state-advancing tap, and the
              // outer feed Swiper doesn't snag the touch.
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleSheetClose();
              }}
              className={cn(
                "swiper-no-swiping gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0 gencl:size-3 gencl:rounded-full gencl:cursor-pointer gencl:border-0 gencl:backdrop-blur-sm gencl:transition-colors gencl:duration-300",
                baseConfig.theme === "light" ? "gencl:bg-secondary-50" : "gencl:bg-secondary-900/50"
              )}>
              <XIcon theme={baseConfig.theme === "light" ? "light" : "dark"} size="xxs" />
            </button>
          </div>
        )}
      </div>
    );

    // Panel/full-view: stack the grabber on its own centred bar above the row.
    if (isPanelOrFull && dragPill) {
      return (
        <div className="gencl:w-full gencl:flex gencl:flex-col gencl:items-center" onClick={(e) => e.stopPropagation()}>
          {dragPill}
          {headerRow}
        </div>
      );
    }
    return headerRow;
  };

  // Pagination is controlled here so dots / nav can render outside the body.
  const swiperRef = useRef<SwiperType | null>(null);
  // Dots show for multiple links. Panel/full-view render them inside the
  // sheet (on the white surface); other states render as a sibling on the
  // video backdrop. Banner-ad mode shows a decorative static strip.
  const BANNER_DOT_COUNT = 4;
  const showDots = links.length > 1 || isBannerAdMode;
  const dotsTotal = isBannerAdMode ? BANNER_DOT_COUNT : links.length;
  const dotsActiveIdx = isBannerAdMode ? 0 : currentLinkIdx;
  const useDesktopNav = isDesktop && view !== "embed";
  // Horizontal peek: on desktop multi-card sheets, show a slim peek of the
  // next card on the right. Single-link sheets stay full-width.
  const enableHorizontalPeek = useDesktopNav && links.length > 1 && !isBannerAdMode;
  const peekSlidesPerView = enableHorizontalPeek ? 1.06 : 1;
  const peekSpaceBetween = enableHorizontalPeek ? 8 : 0;
  // Full-width + centered so dots stay put across state transitions
  // (fixed-width shifted them as the container width changed).
  const dotsWidthMode = "full" as const;

  const handleDotSelect = (idx: number) => {
    setCurrentLinkIdx(idx);
    swiperRef.current?.slideToLoop(idx);
  };
  const noopDotSelect = (_idx: number) => {
    /* banner-ad dots are decorative — no selection action */
  };

  // While the sheet is dragged, detach the inner carousel's event/resize
  // handlers so it doesn't recompute its (horizontal) layout on every vertical
  // resize frame — the main per-frame cost that lags the panel↔expand drag on
  // iOS. Reattach + recalc once on release. Also forwards the outer-feed pause.
  const handleDragState = useCallback(
    (dragging: boolean) => {
      const sw = swiperRef.current;
      if (sw && !sw.destroyed) {
        if (dragging) {
          sw.detachEvents();
        } else {
          sw.attachEvents();
          sw.update();
        }
      }
      onSwiperToggle?.(dragging);
    },
    [onSwiperToggle]
  );

  // Skip dots for `responsive` (pagination lives inside the card body).
  // Still built when `useDesktopNav` — they go between the nav arrows.
  const dotsBlock =
    showDots && !isResponsiveState ? (
      <LinkoutCarouselDots
        total={dotsTotal}
        activeIdx={dotsActiveIdx}
        // Banner-ad dots are non-interactive; other modes wire up selection.
        onSelect={isBannerAdMode ? noopDotSelect : handleDotSelect}
        theme={baseConfig.theme}
        widthMode={dotsWidthMode}
      />
    ) : null;

  // Footer builder (CTA pill + state-conditional inline dots), parameterised
  // on state so each measurement well renders its own footer subtree.
  const renderFooterForState = (state: SheetState) => {
    const panelOrFull = isPanelOrFullStateOf(state);
    const padding = panelOrFull ? "gencl:p-3" : "gencl:p-2";
    return (
      <>
        <LinkoutCTA
          className={padding}
          ctaText={resolveCtaText(links[currentLinkIdx])}
          ctaLink={resolveCtaLink(links[currentLinkIdx])}
          handleCTAClick={handleCTAClick}
        />
        {/* Panel/full-view: dots inside the footer (white surface).
            Other states render them as a sibling below the sheet. */}
        {panelOrFull && dotsBlock}
      </>
    );
  };

  // Render guard. Banner-ad mode keeps rendering even with no fitting ad
  // so the ResizeObserver keeps firing and the picker re-evaluates.
  if (!isBannerAdMode && !links?.length) return null;
  // Flex column with `justify-end`: `100%`-height sheets fill the wrapper
  // (which forwards the host height), while `"auto"` sheets stay pinned to
  // the bottom — a plain full-height wrapper broke that bottom pin.
  const wrapperStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };
  if (isBannerAdMode && !hasRenderableAd) {
    // Mount only the measuring wrapper so the picker reacts to resize.
    return <div ref={linkoutContainerRef} data-slot="dynamic-linkouts" data-ad-mode="empty" style={wrapperStyle} />;
  }

  // ── Desktop expand-view outside-placement: panel-per-slide carousel ─────
  // The whole panel swipes as one unit with the next peeking on the right —
  // the dynamic-sheet's single-panel model can't do that, so bypass it and
  // render a horizontal Swiper of self-contained panels.
  if (scenario === "expand-desktop-outside" && !isBannerAdMode) {
    // Gate on the same open condition as `isOpen` below, or this branch
    // keeps drawing the panel inline after the linkout is closed.
    if (!(isActive && hasContentType("linkouts"))) return null;
    const isMulti = links.length > 1;
    return (
      <div
        ref={linkoutContainerRef}
        data-slot="dynamic-linkouts"
        data-scenario="expand-desktop-outside"
        style={wrapperStyle}>
        <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-full gencl:h-full gencl:justify-end">
          <SafeSuspense fallback={null}>
            <Swiper
              spaceBetween={isMulti ? 8 : 0}
              slidesPerView={isMulti ? 1.06 : 1}
              loop={isMulti}
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              onSlideChange={(s) => setCurrentLinkIdx(s.realIndex)}
              className="gencl:w-full">
              {links.map((link, idx) => {
                const linkTitle = link.title || link.link;
                const slideCtaText = resolveCtaText(link);
                const slideCtaLink = resolveCtaLink(link);
                return (
                  <SwiperSlide key={link.link ?? `link-${idx}`} className="gencl:h-auto">
                    <div
                      className="gencl:bg-white gencl:rounded-lg gencl:overflow-hidden gencl:flex gencl:flex-col"
                      onClick={(e) => e.stopPropagation()}>
                      {/* Top nav — chain-link glyph + URL + close, per-slide so
                          the chrome reflects the active card. */}
                      <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:px-2 gencl:py-1 gencl:border-b gencl:border-secondary-100">
                        <div className="gencl:flex gencl:flex-1 gencl:items-center gencl:gap-1 gencl:min-w-0">
                          <LinkIcon className="gencl:size-[12px] gencl:shrink-0 gencl:stroke-secondary-900" />
                          <p className="gencl:line-clamp-1 gencl:truncate gencl:flex-1 gencl:min-w-0 gencl:text-[8px]! gencl:leading-[12px]! gencl:font-medium! gencl:text-secondary-900">
                            {linkTitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Close"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSheetClose();
                          }}
                          className="gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0 gencl:size-3 gencl:rounded-full gencl:cursor-pointer gencl:border-0 gencl:backdrop-blur-sm gencl:bg-secondary-50">
                          <XIcon theme="light" size="xxs" />
                        </button>
                      </div>
                      {/* Body — reuse LinkCard: rich metadata → `expand-view`,
                          otherwise the compact `default-active` so a sparse
                          card doesn't leave a half-empty rich body. No outer
                          padding — LinkCard owns its own 8 px inset.
                          Enrich brand/website from `brandDetails` + normalize the
                          image exactly like the tile's `linksWithMetadata`
                          (`linkout-item.tsx`), so the `expand-view` MetaRow shows
                          the "<brand> • <website>" line here too, matching the
                          tile — the raw `link` alone leaves it blank. */}
                      <LinkCard
                        data={
                          {
                            ...link,
                            image: link.image?.trim() || undefined,
                            brand: link.brand ?? brandDetails.name,
                            website: link.website ?? brandDetails.website,
                          } as LinkMetaData
                        }
                        sheetState={hasRichLinkMetadata(link) ? "expand-view" : "default-active"}
                        theme="light"
                        onClick={() => handleLinkItemClick(link.link, linkTitle || link.link)}
                        ctaText={slideCtaText}
                        ctaLink={slideCtaLink}
                        onCtaClick={handleCTAClick}
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </SafeSuspense>

          {/* Below the panel: arrow + dots + arrow (multi-link only). Dark
              theme because the row sits on the embed's dark backdrop —
              white-circle buttons would vanish against the light panels. */}
          {isMulti && (
            <div className="gencl:flex gencl:items-center gencl:justify-center gencl:gap-2 gencl:w-full">
              <LinkoutNavButtons
                theme="dark"
                onPrev={() => {
                  if (swiperRef.current) {
                    userSlidePrev(swiperRef.current, "navigation");
                  } else {
                    setCurrentLinkIdx((i) => (i <= 0 ? links.length - 1 : i - 1));
                  }
                }}
                onNext={() => {
                  if (swiperRef.current) {
                    userSlideNext(swiperRef.current, "navigation");
                  } else {
                    setCurrentLinkIdx((i) => (i >= links.length - 1 ? 0 : i + 1));
                  }
                }}
                isPrevDisabled={false}
                isNextDisabled={false}
                middleSlot={dotsBlock}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // In the embed overlay the host (`default-embed`) adds an 8 px bottom inset in
  // compact states for the panel's breathing room. When the sibling dots render
  // below the panel they become the bottom-most element, so that 8 px stacks on
  // top of their own `py-1` — a doubled gap. The dots are a flex item in this
  // `flex-col` wrapper, so a negative bottom margin pushes them down past the
  // flex line into the host's padding, absorbing the duplicate 8 px.
  // The `-4` margin absorbs the overlay host's 8px inset; outside has none, so
  // exclude it or the dots get pulled into the row below.
  const siblingDotsVisible =
    view === "embed" && layout !== "outside" && showDots && !isPanelOrFullState && !isResponsiveState;
  return (
    <div ref={linkoutContainerRef} data-slot="dynamic-linkouts" style={wrapperStyle}>
      {/* Off-screen well feeding the 50%-height reveal gate: measures the tallest
          link's body height PER gated state (default / default-active /
          expand-view), so each reveal hop can decide whether entering that state
          fits before it happens. Mounted wherever the gate applies (tile reveal
          on mobile+desktop, mobile expand). */}
      {gateApplies && links.length > 0 && linkoutContainerSize.w > 0 && (
        <LinkoutExpandHeightWell
          links={links}
          theme={baseConfig.theme}
          // Match the live card's EFFECTIVE width, not the raw container. In the
          // gated reveal states the panel renders `w-[calc(100%-16px)] mx-2`
          // (2 × PANEL_GAP_PX inset) UNLESS the host already inset it
          // (`hostHorizontalInset`). Measuring at full container width over-
          // estimates the space, so a knife's-edge CTA/description that only
          // fits in the wider well would truncate/grow taller in the narrower
          // live card and slip past the gate. See linkouts-sheet-config.ts.
          widthPx={
            hostHorizontalInset ? linkoutContainerSize.w : Math.max(0, linkoutContainerSize.w - 2 * PANEL_GAP_PX)
          }
          // Raw page-level CTA: `LinkCard` resolves `ctaText || link.title ||
          // "Learn more"` per card, matching the live card exactly (incl.
          // multi-link, where each card falls back to its own title).
          ctaText={ctaText}
          onMeasure={handleRevealMeasure}
        />
      )}
      <SafeSuspense fallback={null}>
        {/* Escape wrapper: panel's `overflow: hidden` clips every descendant,
            so the close btn below must be a sibling of the panel, not nested
            inside it (e.g. inside `<LinkCard>`), to poke past its edge. */}
        <div
          style={{ position: "relative" }}
          // SS2 → SS3: tap advances `default` → `default-active` (stops
          // propagation so it doesn't bubble to the tile's open-expand); hover
          // is a desktop accelerator. Scoped to the CARD here — NOT the
          // full-height `data-slot` overlay — so tapping the video/title opens
          // the expand view and leaves the linkout in `default`. No-ops outside
          // the `default` state / non-embed views.
          onClick={(e) => advanceDefaultToActive(() => e.stopPropagation())}
          // Outside is tap-only: hover-advance would grow the card and push the
          // body down. Overlay keeps the hover accelerator.
          onMouseEnter={layout === "outside" ? undefined : () => advanceDefaultToActive()}>
          {sheetOpen && (
            <LazySnapSheet
              // Fresh instance when the slot flips between link and banner-ad.
              key={isBannerAdMode ? "linkouts-banner-ad" : "linkouts-link"}
              snapPoints={snapPoints}
              activeId={linkoutsState}
              onSnap={(id) => setContentTypeState("linkouts", id as SheetState)}
              disabled={sheetDisabled}
              theme={baseConfig.theme}
              // Continuously cross-fade the surface dark↔light across the
              // expand↔panel drag (publishes `--gn-sheet-progress` the header reads
              // for its text/icons), only in the drag-chain states.
              themeProgress={!isBannerAdMode && (linkoutsState === "expand-view" || isPanelOrFullState)}
              // Header owns the inline pill (DragPillTapTarget) + tap-to-advance,
              // so the sheet renders no standalone pill and no tap handler.
              showIndicator={false}
              tapToAdvance={false}
              // One drag = one state step in the drag direction (states are far
              // apart, so "next/previous" is the intent and it can't skip a state).
              stepByStep
              projectionMs={120}
              // Resolve panel/full `%` against the stable viewport, not the
              // player-resized parent (keeps snap targets fixed mid-drag).
              containerHeight={sheetContainerHeight}
              // Publish the drag overshoot (height above the expand snap) and the
              // raw live height so the video resizes continuously both ways:
              // expand→panel shrinks via overshoot (full at expand rest),
              // panel↔full tiles via raw height. Embed overlay has no player
              // frame to target, so these are inert there.
              overshootVar="--gn-linkout-overshoot-h"
              heightVar="--gn-linkout-h"
              // Pause the outer feed swiper while the sheet is being dragged.
              onDragStateChange={handleDragState}
              // Cache each state's measured `auto` height so off-screen auto
              // states (e.g. expand-view) stay reachable as drag targets.
              onAutoMeasure={handleAutoMeasure}
              header={shouldShowHeaderForState(linkoutsState) ? renderHeaderForState(linkoutsState) : undefined}
              footer={shouldShowFooterForState(linkoutsState) ? renderFooterForState(linkoutsState) : undefined}
              // Drop header/footer separators in panel/full + outside layouts.
              headerClassName={isPanelOrFullState || layout === "outside" ? "gencl:border-0" : undefined}
              footerClassName={cn(footerClassName(linkoutsState), isPanelOrFullState && "gencl:border-0")}
              // Banner-ad hugs the ad (w-fit, centred); else the scenario panel class.
              className={isBannerAdMode ? "gencl:rounded-lg! gencl:w-fit! gencl:mx-auto!" : className(linkoutsState)}>
              <SafeSuspense fallback={null}>
                <LinkoutItem
                  linkoutsState={linkoutsState}
                  links={links}
                  onLinkClick={handleLinkItemClick}
                  theme={baseConfig.theme}
                  swiperRef={swiperRef}
                  activeIdx={currentLinkIdx}
                  onActiveIndexChange={setCurrentLinkIdx}
                  ctaText={resolveCtaText(links[currentLinkIdx])}
                  ctaLink={resolveCtaLink(links[currentLinkIdx])}
                  onCtaClick={handleCTAClick}
                  responsiveState={responsiveState}
                  showResponsiveGrid={showResponsiveGrid}
                  forceOrientation={forceOrientation}
                  ctaClassName={ctaClassName}
                  forceFlexRatio={forceFlexRatio}
                  hideThumb={hideThumb}
                  slidesPerView={peekSlidesPerView}
                  spaceBetween={peekSpaceBetween}
                  onTitleMarqueeDuration={setChipMarqueeDurationMs}
                  bannerAd={
                    hasRenderableAd && pickedBannerConfig
                      ? {
                          config: pickedBannerConfig,
                          brandId: resolvedContent.kind === "banner-ad" ? resolvedContent.brandId : undefined,
                        }
                      : undefined
                  }
                />
              </SafeSuspense>
            </LazySnapSheet>
          )}
          {/* `default`-only close btn: sibling of panel, not descendant, so
              panel's `overflow: hidden` doesn't clip it. Centered on the
              panel's actual top-right corner: offset = panel's own gap on
              that side minus half the btn size, so it always sits half-in
              half-out of the card regardless of which width bucket/card
              size is loaded. Vertically the panel never has its own margin
              (gap 0) → top is always -CLOSE_BTN_HALF_PX. Horizontally the
              panel self-insets by PANEL_GAP_PX via `mx-2` UNLESS it's the
              in-player expand panel (no margin, ever — expandPanelClassName)
              or the host already applies its own inset (hostHorizontalInset) —
              see linkouts-sheet-config.ts. */}
          {/* No `×` on the outside card (chrome-less per Figma). */}
          {sheetOpen && linkoutsState === "default" && !isBannerAdMode && layout !== "outside" && (
            <button
              type="button"
              aria-label="Close"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleSheetClose();
              }}
              style={{
                position: "absolute",
                top: -CLOSE_BTN_HALF_PX,
                right: (view === "expand" || hostHorizontalInset ? 0 : PANEL_GAP_PX) - CLOSE_BTN_HALF_PX,
                zIndex: 100000,
              }}
              className={cn(
                "gencl:flex gencl:items-center gencl:justify-center gencl:size-3 gencl:shrink-0 gencl:rounded-full gencl:border-0 gencl:cursor-pointer gencl:backdrop-blur-sm",
                baseConfig.theme === "light" ? "gencl:bg-secondary-50" : "gencl:bg-secondary-900/50"
              )}>
              <XIcon theme={baseConfig.theme === "light" ? "light" : "dark"} size="xxs" />
            </button>
          )}
        </div>
        {/* Sibling dots / desktop nav. Skipped for panel/full-view (dots
          render in the footer) and `responsive` (dots live in the card).
          In the embed overlay, the host's 8 px compact inset is split
          4 px above (card → dots) and 4 px below (dots → scrubber) instead
          of stacking on top of the panel with 0 gap (see
          `siblingDotsVisible`). */}
        {sheetOpen &&
          showDots &&
          !isPanelOrFullState &&
          !isResponsiveState &&
          // Outside chip (bar) carries no dots; the cards still show them.
          !(layout === "outside" && isChipStateOf(linkoutsState)) && (
            <div className="gencl:w-full" style={siblingDotsVisible ? { marginTop: 4, marginBottom: -4 } : undefined}>
              {useDesktopNav ? (
                // Desktop: arrow + dots + arrow inline. Mobile dots-only is the
                // fallback branch below.
                <div className="gencl:flex gencl:items-center gencl:justify-center gencl:gap-2 gencl:w-full gencl:py-1">
                  <LinkoutNavButtons
                    theme={baseConfig.theme}
                    onPrev={() => {
                      if (swiperRef.current) {
                        swiperRef.current.slidePrev();
                      } else {
                        setCurrentLinkIdx((i) => (i <= 0 ? links.length - 1 : i - 1));
                      }
                    }}
                    onNext={() => {
                      if (swiperRef.current) {
                        swiperRef.current.slideNext();
                      } else {
                        setCurrentLinkIdx((i) => (i >= links.length - 1 ? 0 : i + 1));
                      }
                    }}
                    isPrevDisabled={false}
                    isNextDisabled={false}
                    middleSlot={dotsBlock}
                  />
                </div>
              ) : (
                dotsBlock
              )}
            </div>
          )}
      </SafeSuspense>
    </div>
  );
}
