"use client";
import { LinkIcon, XIcon } from "@genuin/ui";
import { cn } from "@genuin/ui/lib/utils";
import { lazy, Suspense, useMemo, useRef, useState, type CSSProperties } from "react";
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
import type { LinkoutSlotContent } from "./types";
import { useLinkoutContainerSize } from "./use-linkout-container-size";

const LazyDynamicSheet = lazy(() =>
  import("@genuin/ui/dynamic-sheet").then((m) => ({
    default: m.DynamicSheet,
  }))
);

export interface DynamicLinkoutsProps {
  links: LinkData[];
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  view?: "embed" | "expand" | "default" | "responsive" | null | undefined;
  layout?: "overlay" | "outside" | null | undefined;
  /** For `view="responsive"`: which content state to show inside the
   *  wide card. `"default"` hides description + chips, `"expand"`
   *  shows everything (Figma 9619-... — see RESPONSIVE_LINKOUT_PLAN). */
  responsiveState?: "default" | "expand";
  analyticsEventData: ReturnType<typeof buildLinkoutsAnalyticsData>;
  onSwiperToggle?: (isOpen: boolean) => void;
  /** Override effectiveVideoWidth from embed context. Used in Storybook/testing. */
  effectiveVideoWidth?: number;
  /** Override aspect ratio from embed context. Used in Storybook/testing (e.g. "16:9"). */
  aspectRatio?: string;
  /** When true, the dynamic-sheet's auto-advance rules from the
   *  selected scenario are bypassed (e.g. embed-default's
   *  `default → expand-view` after 3 s). Used by the storybook
   *  Dynamic View harness so the variant is determined purely by
   *  frame width — no time-based state changes. */
  disableAutoAdvance?: boolean;
  /** Storybook-only debug overlay for the responsive card —
   *  forwards through to `<ResponsiveLinkCard>`'s `showGrid`. */
  showResponsiveGrid?: boolean;
  /**
   * Discriminated union describing what the linkout slot should
   * host. When supplied, takes precedence over the back-compat
   * `links` / `ctaText` / `ctaLink` shape and lets the slot render
   * an IAB banner ad as the no-fill fallback (Figma `Component 3`
   * at node 9563:113378).
   *
   * See `DYNAMIC_LINKOUT_ADS_PLAN.md` for the rollout plan.
   */
  content?: LinkoutSlotContent;
  /**
   * Container dimensions the banner-ad picker should use when
   * resolving which IAB size fits. Supplied by the host when the
   * linkout sits inside an auto-fitting slot whose own measured
   * size is 0 until content fills it — typical for the bottom-pinned
   * embed layout. When omitted, the linkout self-measures via the
   * `useLinkoutContainerSize` hook.
   *
   * Only consumed when `content.kind === "banner-ad"`. Ignored for
   * the link path.
   */
  adContainerSize?: { w: number; h: number };
  /** For `view="responsive"`: override the auto-detected orientation
   *  of the wide card. `<ResponsiveLinkCard>` normally picks
   *  portrait/landscape from its measured aspect ratio — passing this
   *  pins it for hosts that need a deterministic layout (e.g. an
   *  image-on-top row inside a fixed-column grid). Forwarded down
   *  through `<LinkoutItem>` → `<LinkCard>` → `<ResponsiveLinkCard>`. */
  forceOrientation?: "portrait" | "landscape";
  /** For `view="responsive"`: extra Tailwind classes merged onto the
   *  card's CTA pill (the "Sign Up Now" / "Get Started" / "Learn More"
   *  affordance). The base styling (`bg-secondary-900 text-white …`)
   *  stays; this is purely for per-host overrides (custom padding,
   *  border, brand accent). Forwarded down to `<ResponsiveCta>`. */
  ctaClassName?: string;
  /** For `view="responsive"`: override the responsive card's
   *  auto-picked thumb/details flex ratio. Use this to match a
   *  Figma design that needs a bigger image area than the size
   *  bucket's default — e.g. `{ thumb: 3, details: 1 }` for a
   *  75/25 image-to-text split. Forwarded down to
   *  `<ResponsiveLinkCard>`'s `forceFlexRatio`. */
  forceFlexRatio?: FlexRatio;
  /** For `view="responsive"`: skip rendering the thumb / image area
   *  entirely. Use when a separate preview (e.g. a video player) is
   *  composed above this card so the card should only render title /
   *  description / chips / CTA. Forwarded down to
   *  `<ResponsiveLinkCard>`'s `hideThumb`. */
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
  // Resolve the discriminated union from either the new `content`
  // prop or the back-compat `links` / `ctaText` / `ctaLink` shape.
  // The runtime branches on `resolvedContent.kind`; the legacy
  // props remain accepted for back-compat with existing call sites.
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
  // Memoize the scenario config so its `heights` / `enabledStates` /
  // `autoAdvance` references stay stable across renders that don't
  // affect the picker inputs. Without this, every parent render
  // returned a fresh object → the dynamic-sheet's useMemos on
  // `config.heights` / `config.enabledStates` invalidated each
  // render, cascading through `transitionTo` / `findNearestSnapState`
  // / `heightBounds`. Functionally identical to before, just less
  // wasted React work per render.
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
  // The DynamicSheet doesn't push its `initialState` into the parent's
  // sheetContentStates on mount — it only fires `onStateChange` on
  // *transitions*. So when a scenario's intended initial state is
  // anything other than "default" (e.g. `pl-xs`, `pl-sml`,
  // `default-active`, `expand-view`), the parent's `getContentTypeState`
  // returns the fallback "default" until something explicitly pushes
  // the right value. Resolve here: if the parent is on the fallback
  // and the scenario expects a non-default initial state, prefer the
  // scenario's intent for rendering.
  // In banner-ad mode we lock the slot to `default` so the existing
  // panel chrome (Figma `Component 3` at node 9563:113378) hosts the
  // ad — no expand transitions, no auto-advance.
  const linkoutsState: SheetState = isBannerAdMode
    ? "default"
    : rawLinkoutsState !== "default"
      ? rawLinkoutsState
      : (baseConfig.initialState ?? "default");

  // Container size the banner picker reasons about. Prefers the
  // host-supplied `adContainerSize` prop (the dependable path —
  // hosts know the available frame even when the slot itself
  // auto-fits content and measures 0 until filled). Falls back to
  // self-measurement via `useLinkoutContainerSize` for callers that
  // wrap the linkout in a definitely-sized container.
  const { ref: linkoutContainerRef, size: linkoutContainerSize } = useLinkoutContainerSize();
  const resolvedAdContainerSize = adContainerSize ?? linkoutContainerSize;
  // Banner-ad chrome consumes horizontal pixels the banner can't
  // overlap: 8 px from the in-banner padded wrapper added in
  // `<LinkoutItem>` (4 px on each side) to satisfy Figma
  // `Component 3`'s gap around the ad. The sheet panel itself is
  // `w-fit` in banner-ad mode (see the `className` override below),
  // so it hugs the wrapper and consumes no extra horizontal space.
  // The picker reasons about the *usable* width, so subtract this
  // constant from the container width before picking. Height has
  // its own min-container guard (`BANNER_AD_MIN_CONTAINER_HEIGHT`);
  // we leave the height input alone so the existing 200 px floor
  // continues to work as documented.
  const BANNER_SHEET_CHROME_WIDTH = 8;
  const pickedBannerSize: BannerAdSize | null = isBannerAdMode
    ? pickBannerAdSize(Math.max(0, resolvedAdContainerSize.w - BANNER_SHEET_CHROME_WIDTH), resolvedAdContainerSize.h)
    : null;
  const pickedBannerConfig =
    isBannerAdMode && resolvedContent.kind === "banner-ad" && pickedBannerSize
      ? findBannerConfigForSize(resolvedContent.banner, pickedBannerSize)
      : null;
  // When `pickedBannerConfig` is null we have no eligible ad to
  // render — the slot stays empty. The slot remains mounted (so the
  // ResizeObserver keeps firing) and the picker re-evaluates on
  // every resize.
  const hasRenderableAd = isBannerAdMode && pickedBannerConfig !== null;

  // ── State predicates (pure, take a SheetState argument) ─────────────
  // Shared between the visible-render path and the autoHeightProvider
  // callback. Centralising them here lets each measurement well render
  // the exact chrome subtree the real panel would render for that
  // state — without these helpers the wells would render only the
  // body, and states with shared bodies but different chrome (notably
  // `default` vs `default-active`) collapse onto the same measured
  // pixel value and snap collisions cause the drag-time "blink".
  const isDefaultStateOf = (state: SheetState) => state === "default";
  const isInlineCtaStateOf = (state: SheetState) =>
    state === "default" || state === "default-active" || state === "expand-view";
  const isResponsiveStateOf = (state: SheetState) => state === "responsive";
  const isChipStateOf = (state: SheetState) => state === "pl-xs" || state === "pl-sml";
  const isPanelOrFullStateOf = (state: SheetState) => state === "panel-view" || state === "full-view";
  // Sheet header is rendered for active "drawer" states only — never
  // for `default` (no chrome above the card), `responsive` (wide card
  // is fully self-contained), or the chip states (`pl-xs` / `pl-sml`,
  // the chip itself is the entire UI). Also honours the scenario's
  // `showHeader` flag so scenarios that opt out of headers entirely
  // (e.g. `expand-mobile`) keep doing so.
  const shouldShowHeaderForState = (state: SheetState) =>
    showHeader && !isDefaultStateOf(state) && !isResponsiveStateOf(state) && !isChipStateOf(state);
  // Sheet footer (CTA pill) is suppressed for states where the CTA
  // lives inside the body (`default` / `default-active` / `expand-view`
  // all use the LinkCard's inline CTA), for `responsive` (the wide
  // card carries its own CTA), and for the chip states.
  const shouldShowFooterForState = (state: SheetState) =>
    !isInlineCtaStateOf(state) && !isResponsiveStateOf(state) && !isChipStateOf(state);

  const isPanelOrFullState = isPanelOrFullStateOf(linkoutsState);
  // Header padding is 8 px across active states per Figma
  // 8244-20393 Top nav uses `p-[8px]`. Desktop "outside" placement
  // bumps to `sm:p-3!` for the wider expand layout.
  const headerPaddingClass =
    view === "expand" && isDesktop && sheetContentPlacements["linkouts"] === "outside" ? "gencl:sm:p-3!" : "gencl:p-2";

  const handleSheetClose = () => {
    switch (scenario) {
      case "expand-desktop-inside":
        toggleContentType("linkouts");
        break;
      case "expand-desktop-outside":
        if (sheetContentPlacements["linkouts"] === "outside") {
          setContentTypeState("linkouts", "default");
          openContentType("linkouts", "inside", "default");
        } else {
          toggleContentType("linkouts");
        }
        break;
      default:
        resetSheet();
        break;
    }
  };

  const handleLinkItemClick = (link: string, title: string) => {
    track(EventName.LINKOUTS_CLICKED, {
      ...analyticsEventData,
      link_url: link,
      link_title: title,
    });
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleCTAClick = () => {
    track(EventName.LINKOUTS_CTA_CLICKED, {
      ...analyticsEventData,
      cta_link: ctaLink,
      cta_text: ctaText,
    });
    window.open(ctaLink, "_blank", "noopener,noreferrer");
  };

  // ── State predicates derived for the *currently visible* state ─────
  // Thin wrapper kept for the few use sites further below where the
  // visible-render branch reads more naturally without a helper call.
  // The autoHeightProvider callback uses the per-state helpers
  // directly with each measurement-well's own state.
  // `responsive`: the wide-card layout is fully self-contained —
  // title / description / chips / CTA / dots all live inside the
  // card body. Sheet chrome (drag indicator / header / footer /
  // sibling dots) is suppressed entirely. See RESPONSIVE_LINKOUT_PLAN.
  const isResponsiveState = isResponsiveStateOf(linkoutsState);

  // Header JSX builder. State only affects the favicon visibility,
  // the title typography, and the close-button presence — everything
  // else (link data, theme, padding) is shared. Parameterising on
  // `SheetState` lets the autoHeightProvider render the same chrome
  // subtree the real panel would render for that state, so per-state
  // measurement wells resolve to distinct pixel heights and the
  // `default` ↔ `default-active` snap collision (the drag-time
  // "blink") disappears.
  const renderHeaderForState = (state: SheetState) => {
    const isDefault = isDefaultStateOf(state);
    return (
      <div
        className={cn(
          // Header top-nav title is Body 3 - Medium (10 px / 14 lh / 500)
          // across all "active" states per Figma — Default Active
          // (8249-19818), Expand View (8244-20305), and Panel/Full View
          // (8244-20393, 8317-52315). Default state has its own
          // larger header that's suppressed at the panel level.
          "gencl:w-full gencl:transition-all gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:rounded-lg gencl:z-[99999]",
          baseConfig.theme === "light" ? "gencl:text-secondary-900" : "gencl:text-white",
          headerPaddingClass
        )}
        onClick={(e) => e.stopPropagation()}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:flex-1 gencl:min-w-0">
          {/* Favicon — 14×14 white-bg rounded square with the link's
              image. Falls back to a LinkIcon when no image is available.
              Shown for default-active / expand-view / panel-view /
              full-view (Figma drawer-title nodes 8317:52523 and
              8317:52315). Hidden in `default` state per Figma 8244:20303
              where the header is title-only. */}
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
              // No favicon image — render the chain-link icon directly
              // (no white box) per Figma 9621:92218 "Thumbnail
              // fallback". Stroke color follows the panel theme so the
              // icon is visible on both dark and light surfaces.
              <LinkIcon
                className={cn(
                  "gencl:size-[14px] gencl:shrink-0",
                  baseConfig.theme === "light" ? "gencl:stroke-secondary-900" : "gencl:stroke-white"
                )}
              />
            ))}
          <p
            className={cn(
              "gencl:line-clamp-1 gencl:truncate gencl:flex-1 gencl:min-w-0",
              // default — Body 1 Semi Bold (14 px / 20 lh / 600).
              // default-active / expand-view / panel-view / full-view —
              // Body 3 Medium (10 / 14 / 500). Per Figma 8244-20393 the
              // panel-view header uses the same small title as the
              // collapsed states, not a larger headline (the prominent
              // typography lives inside the body now).
              isDefault
                ? "gencl:text-[14px]! gencl:leading-[20px]! gencl:font-semibold!"
                : "gencl:text-[10px]! gencl:leading-[14px]! gencl:font-medium!"
            )}>
            {links[currentLinkIdx]?.title || links[currentLinkIdx]?.link}
          </p>
        </div>
        {/* Close button — 16×16 round with an 8×8 X icon (Figma OctoNavigation
            nodes 8317:52523 / Dark and 8317:52315 / Light). Hidden in
            `default` state where the collapsed header has no controls. */}
        {!isDefault && (
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              handleSheetClose();
            }}
            className={cn(
              "gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0 gencl:size-4 gencl:rounded-full gencl:cursor-pointer gencl:border-0 gencl:backdrop-blur-sm",
              baseConfig.theme === "light" ? "gencl:bg-secondary-50" : "gencl:bg-secondary-900/50"
            )}>
            <XIcon theme={baseConfig.theme === "light" ? "light" : "dark"} size="xxs" />
          </button>
        )}
      </div>
    );
  };

  // Pagination is controlled at this level so the dots / nav buttons can
  // render outside the sheet body — see §A.6 of FULL_DYNAMIC_LINKOUT_PLAN.md.
  const swiperRef = useRef<SwiperType | null>(null);
  // Show dots whenever there are multiple links. For panel-view and
  // full-view they render INSIDE the sheet (beneath the CTA, on the
  // white panel surface) per Figma 8244-20393 / 8244-20676; for the
  // other states they render as a sibling beneath the panel on the
  // video backdrop. Banner-ad mode also shows a static carousel
  // strip below the panel per Figma `Carousel` (9563:113781) — the
  // strip is purely decorative in single-banner mode, mirroring the
  // production chrome the linkout slot exposes.
  const BANNER_DOT_COUNT = 4;
  const showDots = links.length > 1 || isBannerAdMode;
  const dotsTotal = isBannerAdMode ? BANNER_DOT_COUNT : links.length;
  const dotsActiveIdx = isBannerAdMode ? 0 : currentLinkIdx;
  const useDesktopNav = isDesktop && view !== "embed";
  // Dots always use full-width with `justify-center` so they stay
  // centered under the panel across state transitions. The previous
  // `fixed-334` for `expand-view` caused a visible shift when default
  // → default-active → expand-view changed the dots' container width.
  const dotsWidthMode = "full" as const;

  const handleDotSelect = (idx: number) => {
    setCurrentLinkIdx(idx);
    swiperRef.current?.slideToLoop(idx);
  };
  const noopDotSelect = (_idx: number) => {
    /* banner-ad dots are decorative — no selection action */
  };

  // Skip building the dots node entirely for `responsive` — its
  // pagination lives inside the wide card body, not as a sibling
  // and not in the sheet footer.
  const dotsBlock =
    showDots && !useDesktopNav && !isResponsiveState ? (
      <LinkoutCarouselDots
        total={dotsTotal}
        activeIdx={dotsActiveIdx}
        // Banner-ad mode shows a non-interactive strip — there's no
        // carousel to navigate. Other modes wire up the normal
        // link-card selection.
        onSelect={isBannerAdMode ? noopDotSelect : handleDotSelect}
        theme={baseConfig.theme}
        widthMode={dotsWidthMode}
      />
    ) : null;

  // Footer (CTA pill + state-conditional dots) JSX builder. The
  // footer padding and inline-dots inclusion are both keyed off
  // `isPanelOrFullState`, so we parameterise on `SheetState` and let
  // each measurement well render the correct footer subtree for its
  // own state. Same data otherwise.
  const renderFooterForState = (state: SheetState) => {
    const panelOrFull = isPanelOrFullStateOf(state);
    const padding = panelOrFull ? "gencl:p-3" : "gencl:p-2";
    return (
      <>
        <LinkoutCTA
          className={padding}
          ctaText={ctaText || links[currentLinkIdx]?.title || "Learn more"}
          ctaLink={ctaLink ?? links[currentLinkIdx]?.link}
          handleCTAClick={handleCTAClick}
        />
        {/* For panel-view / full-view, the dots live INSIDE the sheet
            footer so they sit on the white panel background instead of
            the video backdrop. Other states keep dots as a sibling
            below the sheet (rendered further down). */}
        {panelOrFull && dotsBlock}
      </>
    );
  };

  // Render guard: skip entirely if neither path can fill the slot.
  // In banner-ad mode we keep rendering even when the picker decides
  // no ad fits so the ResizeObserver attached to the outer wrapper
  // keeps firing — once the container grows large enough for an
  // eligible ad, the picker re-evaluates and the slot fills.
  if (!isBannerAdMode && !links?.length) return null;
  // The wrapper has to balance two competing constraints:
  //
  // 1. Sheets with `heights: { … "100%" }` (notably `responsive`
  //    *and* the `full-view` state in `expand-mobile` /
  //    `expand-desktop-inside`) read `parentElement.clientHeight`
  //    to resolve the percentage. The wrapper has to forward the
  //    host's height — so it gets `width: 100%; height: 100%`.
  // 2. Sheets with `"auto"` heights are pinned to the bottom of
  //    the host frame via a flex column with `justify-end` on the
  //    *host*. A full-height wrapper without its own flex layout
  //    would fill the host's flex slot and push the auto-sized
  //    sheet to the wrapper's top edge — breaking the bottom pin
  //    (the DefaultActiveEmbed / PanelViewEmbed regression).
  //
  // Solution: make the wrapper itself a flex column with
  // `justify-end`. The sheet sits at the wrapper's bottom edge in
  // auto-height scenarios, and fills the wrapper in `100%` scenarios.
  // Works uniformly across views.
  const wrapperStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  };
  if (isBannerAdMode && !hasRenderableAd) {
    // Mount only the measuring wrapper so the picker can react to
    // resize. The sheet itself stays unmounted.
    return <div ref={linkoutContainerRef} data-slot="dynamic-linkouts" data-ad-mode="empty" style={wrapperStyle} />;
  }

  return (
    <div ref={linkoutContainerRef} data-slot="dynamic-linkouts" style={wrapperStyle}>
      <SafeSuspense fallback={null} errorFallback={null}>
        <LazyDynamicSheet
          // Force a fresh sheet instance whenever the slot flips
          // between the link path and banner-ad mode. The dynamic
          // sheet keeps its own internal `currentState` across prop
          // changes (useState lazy-init only fires once per instance);
          // without this remount, switching from a link rendered at
          // `expand-view` to an ad whose `enabledStates` only includes
          // `default` leaves the sheet stuck at `expand-view` and the
          // height-transition runs off the resulting sentinel,
          // sliding the panel off-screen.
          key={isBannerAdMode ? "linkouts-banner-ad" : "linkouts-link"}
          isOpen={isActive && hasContentType("linkouts")}
          renderMode="inline"
          config={{
            ...baseConfig,
            // Override the scenario's static `initialState` with the
            // currently-resolved `linkoutsState` so the dynamic-sheet's
            // internal state machine matches what the host wants to
            // render. Without this, when the host (e.g. a Storybook
            // harness) sets the parent state to `default-active` after
            // mount via `openContentType`, the sheet's panel height
            // would stay frozen at the scenario's default, clipping
            // taller layouts.
            initialState: linkoutsState,
            // Bypass time-based auto-advance when the host wants the
            // variant to be controlled externally (e.g. width-based
            // picking in the Dynamic View story). Also forced off in
            // banner-ad mode — the slot stays locked to `default`.
            ...(disableAutoAdvance || isBannerAdMode ? { autoAdvance: undefined } : {}),
            // Lock the slot to `default` only in banner-ad mode. The
            // sheet's `enabledStates` is configured per-scenario; we
            // tighten it here to a single state so swipe / drag can't
            // transition the slot away from where the ad lives. Also
            // pin `heights["default"]` to `"auto"` so the panel sizes
            // to the banner content regardless of which scenario the
            // width-bucket picker resolved — some picks (e.g.
            // `embed-xs` when `effectiveVideoWidth` is missing) don't
            // define `heights["default"]` and the sheet would fall
            // back to `DEFAULT_HEIGHTS["default"] = 15%` of a
            // zero-height container, leaving the slot collapsed.
            ...(isBannerAdMode
              ? {
                  enabledStates: ["default"] as const,
                  heights: { ...(baseConfig.heights ?? {}), default: "auto" as const },
                  disableDragAndSwipe: true,
                }
              : {}),
            onStateChange: (state) => setContentTypeState("linkouts", state),
            onClose: handleSheetClose,
          }}
          // `default` and `default-active` both carry the inline CTA
          // pill inside the LinkCard (Figma 8244-20303 / 8249-19818) —
          // suppress the sheet footer in both. Sheet header is only
          // suppressed for `default` (the resting state with no
          // chrome); `default-active` keeps the favicon + title + close
          // header. `responsive` is fully self-contained — header AND
          // footer suppressed.
          header={shouldShowHeaderForState(linkoutsState) ? renderHeaderForState(linkoutsState) : undefined}
          footer={shouldShowFooterForState(linkoutsState) ? renderFooterForState(linkoutsState) : undefined}
          // Suppress the dynamic-sheet's default top/bottom borders on
          // header / footer in panel-view + full-view per Figma — those
          // detail layouts compose without separator lines between the
          // header band, the body, and the CTA footer band. Outside-
          // layout panels (Figma 10075:76988) also drop the header
          // separator: the `default-active` / `expand-view` light-theme
          // panels render the header flush against the card body.
          headerClassName={isPanelOrFullState || layout === "outside" ? "gencl:border-0" : undefined}
          footerClassName={cn(footerClassName(linkoutsState), isPanelOrFullState && "gencl:border-0")}
          // Banner-ad mode: shrink the panel to content width so the
          // 4 px-padded wrapper around the banner produces the
          // designed `bannerW + 8 px` panel footprint (Figma
          // `Component 3` at 9563:113782 — the panel hugs the ad and
          // is centred in the frame). The default-family
          // `panelFullClassName` would otherwise stretch the panel
          // edge-to-edge and waste the surrounding space.
          className={isBannerAdMode ? "gencl:rounded-lg! gencl:w-fit! gencl:mx-auto!" : className(linkoutsState)}
          onSwiperToggle={onSwiperToggle}
          // Per-state height provider for scenarios that enable two or
          // more `"auto"` states whose bodies differ (e.g. `embed-xs` /
          // `embed-sml` enable both `default-active` (compact card) and
          // `expand-view` (rich card)). Without this, the engine would
          // measure only the currently-mounted body and the two states
          // would collide on a single snap height. The provider renders
          // each state's body in a hidden well so the engine reads its
          // natural pixel height. Banner-ad mode keeps its single
          // `default` state and has no LinkoutItem-per-state shape, so
          // we skip it there.
          autoHeightProvider={
            isBannerAdMode || !links?.length
              ? undefined
              : (state) => {
                  // Render the *same chrome + body subtree the real
                  // panel would render for this state*, so the engine's
                  // per-state measurement well resolves to the actual
                  // pixel height that state will occupy. Body-only
                  // wells collapse `default` ↔ `default-active` onto
                  // a single snap height (the bodies are identical via
                  // `<LinkCard>`'s `isDefaultLike` predicate), and the
                  // missing header is what makes them visually
                  // distinct. Including the conditional header /
                  // footer here gives each state a distinct measured
                  // height and eliminates the drag-time "blink" from
                  // colliding snap points.
                  const s = state as SheetState;
                  // Wells are measurement-only — they MUST NOT claim
                  // shared refs / callbacks from the visible body or
                  // the wells will overwrite them on mount and break
                  // navigation. Two specific footguns:
                  //   1. `swiperRef` — each well's Swiper instance
                  //      (`default-active` / `expand-view` wells)
                  //      writes to `swiperRef.current` via `onSwiper`,
                  //      racing the visible Swiper. Whichever mounts
                  //      last wins the ref and dot navigation drives
                  //      the wrong (hidden) carousel.
                  //   2. `onActiveIndexChange` — a well's Swiper that
                  //      starts at a different slide index would push
                  //      its index back into the parent's state, fighting
                  //      the visible Swiper's controlled index.
                  // Both are dropped here so wells stay inert
                  // measurement targets.
                  return (
                    <>
                      {shouldShowHeaderForState(s) && renderHeaderForState(s)}
                      <LinkoutItem
                        linkoutsState={s}
                        links={links}
                        onLinkClick={handleLinkItemClick}
                        theme={baseConfig.theme}
                        activeIdx={currentLinkIdx}
                        ctaText={ctaText || links[currentLinkIdx]?.title || "Learn more"}
                        ctaLink={ctaLink || links[currentLinkIdx]?.link}
                        onCtaClick={handleCTAClick}
                        responsiveState={responsiveState}
                        showResponsiveGrid={showResponsiveGrid}
                        forceOrientation={forceOrientation}
                        ctaClassName={ctaClassName}
                        forceFlexRatio={forceFlexRatio}
                        hideThumb={hideThumb}
                      />
                      {shouldShowFooterForState(s) && renderFooterForState(s)}
                    </>
                  );
                }
          }>
          <SafeSuspense fallback={null} errorFallback={null}>
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
        </LazyDynamicSheet>
        {/* Sibling dots / desktop nav. Panel-view and full-view render
          their dots inside the sheet footer (see `ctaFooter` above),
          so we skip the sibling render for those states to avoid
          double dots. `responsive` carries its dots inside the wide
          card itself, so we suppress sibling dots there too. */}
        {showDots &&
          !isPanelOrFullState &&
          !isResponsiveState &&
          (useDesktopNav ? (
            <div className="gencl:flex gencl:items-center gencl:justify-center gencl:w-full gencl:py-1">
              <LinkoutNavButtons
                theme={baseConfig.theme}
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
              />
            </div>
          ) : (
            dotsBlock
          ))}
      </SafeSuspense>
    </div>
  );
}
