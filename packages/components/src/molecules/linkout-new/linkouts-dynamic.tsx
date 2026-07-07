"use client";
import { LinkIcon, XIcon } from "@genuin/ui";
import type { SnapPoint } from "@genuin/ui/dynamic-sheet";
import { cn } from "@genuin/ui/lib/utils";
import { lazy, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { useAnalytics } from "@genuin/components/context/analytics/context";
import type { SheetState } from "@genuin/components/context/base/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import {
  LinkoutItem,
  LinkoutCarouselDots,
  LinkoutNavButtons,
} from "@genuin/components/molecules/linkout-new/linkout-item";
import { getLinkoutsConfig } from "@genuin/components/molecules/linkout-new/linkouts-sheet-config";
import type { FlexRatio } from "@genuin/components/molecules/linkout-new/responsive-card";
import { LinkoutCTA } from "@genuin/components/molecules/linkouts/linkout-cta";
import type { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import { userSlideNext, userSlidePrev } from "@genuin/components/organisms/player-swiper/swipe-intent";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { findBannerConfigForSize, pickBannerAdSize, type BannerAdSize } from "./banner-ad-picker";
import { LinkCard } from "./link-card";
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
function DragPillTapTarget({ onTap }: { onTap: () => void }) {
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
      // `touch-action: none` — the sheet can't follow the move.
      style={{ touchAction: "none" }}
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

/** True when the link has any optional field the rich `expand-view` card
 *  surfaces; lets sparse links fall back to the compact `default-active`. */
function hasRichLinkMetadata(link: LinkData): boolean {
  return Boolean(
    link.description ||
      link.brand ||
      link.website ||
      link.originalPrice ||
      link.currentPrice ||
      link.rating ||
      link.likes ||
      link.downloads ||
      link.phone ||
      link.address
  );
}

export interface DynamicLinkoutsProps {
  links: LinkData[];
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  view?: "embed" | "expand" | "default" | "responsive" | null | undefined;
  layout?: "overlay" | "outside" | null | undefined;
  /** For `view="responsive"`: `"default"` hides description + chips,
   *  `"expand"` shows everything. */
  responsiveState?: "default" | "expand";
  analyticsEventData: ReturnType<typeof buildLinkoutsAnalyticsData>;
  onSwiperToggle?: (isOpen: boolean) => void;
  /** Override effectiveVideoWidth from embed context. Used in Storybook/testing. */
  effectiveVideoWidth?: number;
  /** Override aspect ratio from embed context. Used in Storybook/testing (e.g. "16:9"). */
  aspectRatio?: string;
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
}

export function DynamicLinkouts({
  links,
  ctaText,
  ctaLink,
  isActive,
  view,
  layout,
  analyticsEventData,
  onSwiperToggle,
  effectiveVideoWidth: effectiveVideoWidthProp,
  aspectRatio: aspectRatioProp,
  disableAutoAdvance = false,
  responsiveState = "default",
  showResponsiveGrid = false,
  content,
  adContainerSize,
  forceOrientation,
  ctaClassName,
  forceFlexRatio,
  hideThumb,
}: DynamicLinkoutsProps) {
  // Resolve from the `content` prop or the back-compat link-shape props.
  const resolvedContent: LinkoutSlotContent = useMemo<LinkoutSlotContent>(
    () => content ?? { kind: "link", links, ctaText, ctaLink },
    [content, links, ctaText, ctaLink]
  );
  const isBannerAdMode = resolvedContent.kind === "banner-ad";
  const [currentLinkIdx, setCurrentLinkIdx] = useState(0);
  const { track, EventName } = useAnalytics();
  const {
    hasContentType,
    getContentTypeState,
    setContentTypeState,
    resetSheet,
    toggleContentType,
    openContentType,
    closeContentType,
    sheetContentPlacements,
  } = useSheetState();

  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const {
    responsive: { effectiveVideoWidth: contextVideoWidth },
    dimensions: { aspectRatio: contextAspectRatio },
  } = useEmbedConfigs();
  const effectiveVideoWidth = effectiveVideoWidthProp ?? contextVideoWidth;
  const aspectRatio = aspectRatioProp ?? contextAspectRatio;
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
      }),
    [view, isMobile, effectiveVideoWidth, aspectRatio, linkoutPlacement, rawLinkoutsState, layout]
  );
  // DynamicSheet only fires `onStateChange` on transitions, never pushing
  // its `initialState` on mount — so the parent reads "default" until then.
  // Prefer the scenario's intended initial state to bridge that gap.
  // Banner-ad mode locks to `default` (no transitions/auto-advance).
  const linkoutsState: SheetState = isBannerAdMode
    ? "default"
    : rawLinkoutsState !== "default"
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
  const [viewportH, setViewportH] = useState(0);
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
  const enabledStates = (baseConfig.enabledStates ?? []) as SheetState[];
  const heightsCfg = (baseConfig.heights ?? {}) as Partial<Record<SheetState, unknown>>;
  const [measuredAuto, setMeasuredAuto] = useState<Partial<Record<SheetState, number>>>({});
  const handleAutoMeasure = useCallback((id: string, px: number) => {
    setMeasuredAuto((prev) => (Math.abs((prev[id as SheetState] ?? 0) - px) > 1 ? { ...prev, [id]: px } : prev));
  }, []);
  const currentSnap: SnapPoint = {
    id: linkoutsState,
    height: toSnapHeight(heightsCfg[linkoutsState] ?? "auto"),
  };
  const otherDragSnaps: SnapPoint[] = DRAG_STATES.filter((s) => s !== linkoutsState && enabledStates.includes(s))
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

  // Time-based auto-advance (e.g. `default-active → expand-view`), formerly
  // owned by the dynamic-sheet. SnapSheet is pure-controlled, so the host
  // drives it. Off when the host opts out or in banner-ad mode.
  useEffect(() => {
    if (disableAutoAdvance || isBannerAdMode || !sheetOpen) return;
    const rule = (baseConfig.autoAdvance ?? []).find((r) => r.from === linkoutsState);
    if (!rule) return;
    const timer = setTimeout(() => setContentTypeState("linkouts", rule.to), rule.delayMs);
    return () => clearTimeout(timer);
  }, [linkoutsState, sheetOpen, disableAutoAdvance, isBannerAdMode, baseConfig.autoAdvance, setContentTypeState]);

  // 8 px header padding across active states; desktop "outside" bumps to
  // `sm:p-3!` for the wider expand layout.
  const headerPaddingClass =
    view === "expand" && isDesktop && sheetContentPlacements["linkouts"] === "outside" ? "gencl:sm:p-3!" : "gencl:p-2";

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

  const handleCTAClick = () => {
    track(EventName.LINKOUTS_CTA_CLICKED, {
      ...analyticsEventData,
      cta_link: ctaLink,
      cta_text: ctaText,
    });
  };

  // `responsive` is fully self-contained — all sheet chrome suppressed.
  const isResponsiveState = isResponsiveStateOf(linkoutsState);

  // Header builder, parameterised on state so the autoHeightProvider wells
  // render the same chrome (avoids the default/default-active snap "blink").
  // State only affects favicon, title typography, and close-button presence.
  const renderHeaderForState = (state: SheetState) => {
    const isDefault = isDefaultStateOf(state);
    return (
      <div
        className={cn(
          "gencl:w-full gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:rounded-lg gencl:z-[99999]",
          headerPaddingClass
        )}
        // Foreground colour continuously mixed against the drag progress (the
        // title inherits it). Var-driven, so no CSS transition (that would lag).
        style={{ color: SHEET_FG_MIX }}
        onClick={(e) => e.stopPropagation()}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:flex-1 gencl:min-w-0">
          {/* Favicon — 14×14 image (LinkIcon fallback). Shown for the
              active states; hidden in `default` (title-only header). */}
          {!isDefault &&
            (links[currentLinkIdx]?.image ? (
              <span className="gencl:relative gencl:size-[14px] gencl:shrink-0 gencl:rounded-[4px] gencl:overflow-hidden gencl:bg-white">
                <img
                  src={links[currentLinkIdx]?.image ?? undefined}
                  alt=""
                  className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
                />
              </span>
            ) : (
              // No image — chain-link icon (no white box); stroke tracks
              // the theme so it shows on both surfaces.
              <LinkIcon
                className="gencl:size-[14px] gencl:shrink-0"
                // Stroke continuously mixed against the drag progress (matches text).
                style={{ stroke: SHEET_FG_MIX }}
              />
            ))}
          <p
            className={cn(
              "gencl:line-clamp-1 gencl:truncate gencl:flex-1 gencl:min-w-0",
              // default uses a larger title; all active states share the
              // small Body-3 title (prominent typography lives in the body).
              isDefault
                ? "gencl:text-[14px]! gencl:leading-[20px]! gencl:font-semibold!"
                : "gencl:text-[10px]! gencl:leading-[14px]! gencl:font-medium!"
            )}>
            {links[currentLinkIdx]?.title || links[currentLinkIdx]?.link}
          </p>
        </div>
        {/* Inline drag indicator in the top-nav row (replaces the sheet's
            standalone pill, suppressed via `showIndicator: false`). Pointer
            events bubble to the sheet's drag handler. Colour is inline —
            translucent classes aren't always emitted into the SDK CSS bundle.
            Tap advances one state (iOS Safari can't always drag far enough). */}
        {!isDefault && !baseConfig.disableDragAndSwipe && (
          <DragPillTapTarget
            onTap={() => {
              const order: SheetState[] = ["default-active", "expand-view", "panel-view", "full-view"];
              const enabled = baseConfig.enabledStates ?? order;
              const currentIdx = order.indexOf(linkoutsState);
              const next = order.slice(currentIdx + 1).find((s) => enabled.includes(s));
              if (next) setContentTypeState("linkouts", next);
            }}
          />
        )}
        {/* Close button. Wrapped in a flex-1 group so it sits right-aligned
            and the drag pill stays visually centred against the title. */}
        {!isDefault && (
          <div className="gencl:flex gencl:flex-1 gencl:justify-end gencl:min-w-0">
            <button
              type="button"
              aria-label="Close"
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
                "swiper-no-swiping gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0 gencl:size-4 gencl:rounded-full gencl:cursor-pointer gencl:border-0 gencl:backdrop-blur-sm gencl:transition-colors gencl:duration-300",
                baseConfig.theme === "light" ? "gencl:bg-secondary-50" : "gencl:bg-secondary-900/50"
              )}>
              <XIcon theme={baseConfig.theme === "light" ? "light" : "dark"} size="xxs" />
            </button>
          </div>
        )}
      </div>
    );
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
          ctaText={ctaText || links[currentLinkIdx]?.title || "Learn more"}
          // `||` not `??`: an empty-string ctaLink must fall back to the current link, otherwise
          // `<LinkoutCTA>`'s anchor renders with an empty href and the CTA navigates nowhere.
          ctaLink={ctaLink || links[currentLinkIdx]?.link || ""}
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
                const slideCtaText = ctaText || linkTitle || "Learn more";
                const slideCtaLink = ctaLink ?? link.link;
                return (
                  <SwiperSlide key={link.link ?? `link-${idx}`} className="gencl:h-auto">
                    <div
                      className="gencl:bg-white gencl:rounded-lg gencl:overflow-hidden gencl:flex gencl:flex-col"
                      onClick={(e) => e.stopPropagation()}>
                      {/* Top nav — favicon (LinkIcon fallback) + URL + close,
                          per-slide so the chrome reflects the active card. */}
                      <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:p-2 gencl:border-b gencl:border-secondary-100">
                        <div className="gencl:flex gencl:flex-1 gencl:items-center gencl:gap-1 gencl:min-w-0">
                          {link.image ? (
                            <span className="gencl:relative gencl:size-[14px] gencl:shrink-0 gencl:rounded-[4px] gencl:overflow-hidden gencl:bg-white">
                              <img
                                src={link.image ?? undefined}
                                alt=""
                                className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
                              />
                            </span>
                          ) : (
                            <LinkIcon className="gencl:size-[14px] gencl:shrink-0 gencl:stroke-secondary-900" />
                          )}
                          <p className="gencl:line-clamp-1 gencl:truncate gencl:flex-1 gencl:min-w-0 gencl:text-[10px]! gencl:leading-[14px]! gencl:font-medium! gencl:text-secondary-900">
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
                          className="gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0 gencl:size-4 gencl:rounded-full gencl:cursor-pointer gencl:border-0 gencl:backdrop-blur-sm gencl:bg-secondary-50">
                          <XIcon theme="light" size="xxs" />
                        </button>
                      </div>
                      {/* Body — reuse LinkCard: rich metadata → `expand-view`,
                          otherwise the compact `default-active` so a sparse
                          card doesn't leave a half-empty rich body. No outer
                          padding — LinkCard owns its own 8 px inset. */}
                      <LinkCard
                        data={link as LinkData}
                        sheetState={hasRichLinkMetadata(link as LinkData) ? "expand-view" : "default-active"}
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
  const siblingDotsVisible = view === "embed" && showDots && !isPanelOrFullState && !isResponsiveState;
  return (
    <div ref={linkoutContainerRef} data-slot="dynamic-linkouts" style={wrapperStyle}>
      <SafeSuspense fallback={null}>
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
                ctaText={ctaText || links[currentLinkIdx]?.title || "Learn more"}
                ctaLink={ctaLink || links[currentLinkIdx]?.link}
                onCtaClick={handleCTAClick}
                responsiveState={responsiveState}
                showResponsiveGrid={showResponsiveGrid}
                forceOrientation={forceOrientation}
                ctaClassName={ctaClassName}
                forceFlexRatio={forceFlexRatio}
                hideThumb={hideThumb}
                slidesPerView={peekSlidesPerView}
                spaceBetween={peekSpaceBetween}
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
        {/* Sibling dots / desktop nav. Skipped for panel/full-view (dots
          render in the footer) and `responsive` (dots live in the card).
          In the embed overlay, `-mb-2` pulls the block down into the host's
          8 px compact inset so the dots aren't double-spaced (see
          `siblingDotsVisible`). */}
        {showDots && !isPanelOrFullState && !isResponsiveState && (
          <div className="gencl:w-full" style={siblingDotsVisible ? { marginBottom: -8 } : undefined}>
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
