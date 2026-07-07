"use client";

import { cn } from "@genuin/ui/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { lazy, useId, type RefObject } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { useBaseContext } from "@genuin/components/context";
import type { SheetState } from "@genuin/components/context/base/event-bus";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type {
  GenAdBannerConfig,
  GenAdConfig,
} from "@genuin/components/molecules/feed-player/gen-ad-container/gen-ad.types";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { LinkCard, type LinkMetaData } from "./link-card";
import type { FlexRatio } from "./responsive-card";

import "swiper/css";

// Lazy-load so the GenAd SDK isn't pulled into the bundle for callers
// that never render the banner-ad branch.
const GenAdContainer = lazy(() =>
  import("@genuin/components/molecules/feed-player/gen-ad-container").then((m) => ({
    default: m.GenAdContainer,
  }))
);

/** Stable no-op for `<GenAdContainer>`'s required `moveToNextVideo` — the
 *  linkout slot has no "next video". */
const noop = (): void => {};

// ─── AutoCycleView ─────────────────────────────────────────────────────────────
// One LinkCard at a time, for the chip + resting states (pl-xs / pl-sml /
// default). Name is historical — navigation is parent-controlled via `activeIdx`.

function AutoCycleView({
  links,
  sheetState,
  theme = "dark",
  activeIdx = 0,
  onLinkClick,
  ctaText,
  ctaLink,
  onCtaClick,
}: {
  links: LinkMetaData[];
  sheetState: SheetState;
  theme?: "light" | "dark";
  activeIdx?: number;
  onLinkClick?: (link: string, title: string) => void;
  /** Forwarded to `<LinkCard>` for the `default` branch's inline CTA pill. */
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
}) {
  const current = links[activeIdx];
  if (!current) return null;

  return (
    <LinkCard
      data={current}
      sheetState={sheetState}
      theme={theme}
      onClick={() => onLinkClick?.(current.link, current.title ?? current.link)}
      ctaText={ctaText}
      ctaLink={ctaLink}
      onCtaClick={onCtaClick}
    />
  );
}

// ─── LinkoutNavButtons (desktop prev/next chevrons) ──────────────────────────
// Re-exported so the parent can render outside the sheet body, alongside
// the dots, on desktop scenarios.

export function LinkoutNavButtons({
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  theme = "dark",
  middleSlot,
}: {
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  theme?: "light" | "dark";
  /** Content between the prev/next buttons — used to inline the dots. */
  middleSlot?: React.ReactNode;
}) {
  const isDark = theme === "dark";
  const btnBase =
    "gencl:flex gencl:cursor-pointer gencl:items-center gencl:justify-center gencl:rounded-full gencl:size-6 gencl:shrink-0 gencl:transition-opacity";
  const btnEnabled = isDark
    ? "gencl:bg-black/50 gencl:hover:bg-black/70"
    : "gencl:bg-white gencl:border gencl:border-secondary-150";
  const btnDisabled = "gencl:opacity-40 gencl:cursor-not-allowed";
  const iconColor = isDark ? "gencl:text-white" : "gencl:text-secondary-900";

  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      <button
        type="button"
        aria-label="Previous"
        disabled={isPrevDisabled}
        onClick={onPrev}
        className={cn(btnBase, btnEnabled, isPrevDisabled && btnDisabled)}>
        <ChevronLeft className={cn("gencl:size-3", iconColor)} strokeWidth={2} />
      </button>
      {middleSlot}
      <button
        type="button"
        aria-label="Next"
        disabled={isNextDisabled}
        onClick={onNext}
        className={cn(btnBase, btnEnabled, isNextDisabled && btnDisabled)}>
        <ChevronRight className={cn("gencl:size-3", iconColor)} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── LinkoutCarouselDots ─────────────────────────────────────────────────────
// Pure-prop dots, rendered as a sibling of the sheet so they sit on the
// video backdrop below the panel. `widthMode`: full-width vs fixed 334 px.

export function LinkoutCarouselDots({
  total,
  activeIdx,
  onSelect,
  theme = "dark",
  widthMode = "full",
}: {
  total: number;
  activeIdx: number;
  onSelect: (idx: number) => void;
  theme?: "light" | "dark";
  widthMode?: "full" | "fixed-334";
}) {
  if (total <= 1) return null;
  // Dot colours track the panel theme (light = outside-layout placement,
  // dark = inside embed).
  const isLight = theme === "light";
  const activeBg = isLight ? "gencl:bg-secondary-700" : "gencl:bg-secondary-600";
  const inactiveBg = isLight ? "gencl:bg-secondary-150" : "gencl:bg-secondary-100";

  return (
    <div
      className={cn(
        "gencl:flex gencl:gap-2 gencl:items-center gencl:justify-center gencl:py-1",
        widthMode === "fixed-334" ? "gencl:w-[334px] gencl:mx-auto" : "gencl:w-full"
      )}>
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={`linkout-dot-${idx}`}
          type="button"
          aria-label={`Go to slide ${idx + 1}`}
          aria-current={idx === activeIdx ? "true" : undefined}
          onClick={() => onSelect(idx)}
          className={cn(
            "gencl:w-[6px] gencl:h-[6px] gencl:rounded-full gencl:transition-colors gencl:duration-200 gencl:focus-visible:outline gencl:focus-visible:outline-2 gencl:focus-visible:outline-offset-2 gencl:focus-visible:outline-secondary-500",
            idx === activeIdx ? activeBg : inactiveBg
          )}
        />
      ))}
    </div>
  );
}

// ─── LinkoutItem ──────────────────────────────────────────────────────────────
// Body of the linkout sheet — an AutoCycleView (single card, for chip /
// default states) or a Swiper (expand-view / panel-view / full-view).

export function LinkoutItem({
  links,
  linkoutsState,
  theme,
  swiperRef,
  activeIdx,
  onLinkClick,
  onActiveIndexChange,
  ctaText,
  ctaLink,
  onCtaClick,
  responsiveState,
  showResponsiveGrid,
  bannerAd,
  forceOrientation,
  ctaClassName,
  forceFlexRatio,
  hideThumb,
  slidesPerView,
  spaceBetween,
}: {
  links: LinkData[];
  linkoutsState: SheetState;
  theme?: "light" | "dark";
  /** Optional ref the parent passes to drive the Swiper from outside
   *  (used by `<LinkoutCarouselDots>` / `<LinkoutNavButtons>`). */
  swiperRef?: RefObject<SwiperType | null>;
  /** When supplied, the parent owns `activeIdx` (controlled mode); the
   *  AutoCycleView renders the card at that index. Optional — when
   *  omitted, AutoCycleView falls back to internal state. */
  activeIdx?: number;
  onLinkClick?: (link: string, title: string) => void;
  onActiveIndexChange?: (idx: number) => void;
  /** Page-level CTA, forwarded to `<LinkCard>` for the `default` inline pill. */
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
  /** `<LinkCard>`'s responsive content state: `"default"` hides desc + chips. */
  responsiveState?: "default" | "expand";
  /** Storybook-only debug overlay for the responsive card. */
  showResponsiveGrid?: boolean;
  /**
   * In-linkout banner ad. When set, the link path is bypassed and a
   * `<GenAdContainer>` renders in place of `<LinkCard>`, sized to
   * `config.size`; `<DynamicLinkouts>` locks the slot to `default`.
   */
  bannerAd?: {
    config: GenAdBannerConfig;
    brandId?: string;
    /** Analytics `ad_type` override (default `"linkout_banner"`). */
    adType?: string;
  };
  /** Forwarded to `<ResponsiveLinkCard>` — pin orientation. */
  forceOrientation?: "portrait" | "landscape";
  /** Forwarded to `<ResponsiveLinkCard>` — extra CTA pill classes. */
  ctaClassName?: string;
  /** Forwarded to `<ResponsiveLinkCard>` — override thumb/details flex ratio. */
  forceFlexRatio?: FlexRatio;
  /** Forwarded to `<ResponsiveLinkCard>` — skip the thumb area. */
  hideThumb?: boolean;
  /** Swiper override (used by the expand-desktop-outside peek layout). */
  slidesPerView?: number | "auto";
  spaceBetween?: number;
}) {
  const { brandDetails } = useBaseContext();
  const generatedAdSlotId = useId();

  if (bannerAd) {
    // Banner-ad branch — replaces the link card. `<GenAdContainer>` renders
    // absolutely positioned, so a relative wrapper sized to the banner suffices.
    const adConfig: GenAdConfig = {
      adSlotId: `linkout-banner-${generatedAdSlotId.replace(/[:]/g, "-")}`,
      banner: bannerAd.config,
      ...(bannerAd.brandId ? { brandDetails: { brandId: bannerAd.brandId } } : {}),
    };
    return (
      // Outer padded wrapper — 4 px gap around the banner; the panel fill
      // comes from the sheet chrome below. Inner box is the exact banner size.
      <div
        style={{
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <div
          data-testid="linkout-banner-ad"
          data-ad-size={`${bannerAd.config.size[0]}x${bannerAd.config.size[1]}`}
          style={{
            position: "relative",
            width: bannerAd.config.size[0],
            height: bannerAd.config.size[1],
          }}>
          <SafeSuspense fallback={null}>
            <GenAdContainer
              config={adConfig}
              isActive
              isVisible
              // No "next video" here — no-op on ad completion.
              moveToNextVideo={noop}
              // Disambiguate analytics from `<FeedPlayer>`'s overlay events.
              videoType={bannerAd.adType ?? "linkout_banner"}
            />
          </SafeSuspense>
        </div>
      </div>
    );
  }

  const linksWithMetadata: LinkMetaData[] = links.map((l) => ({
    link: l.link,
    title: l.title,
    image: l.image ?? brandDetails.logo,
    // Per-link brand/website override the brandDetails fallback when present.
    brand: l.brand ?? brandDetails.name,
    website: l.website ?? brandDetails.website,
    description: l.description ?? undefined,
    originalPrice: l.originalPrice ?? undefined,
    currentPrice: l.currentPrice ?? undefined,
    rating: l.rating ?? undefined,
    likes: l.likes ?? undefined,
    downloads: l.downloads ?? undefined,
    phone: l.phone ?? undefined,
    address: l.address ?? undefined,
  }));

  if (linkoutsState === "pl-xs" || linkoutsState === "pl-sml" || linkoutsState === "default") {
    // Chip + resting `default` render a single card (no slider). Chips let
    // touchmove bubble to the host carousel; `default` soon auto-advances.
    return (
      <AutoCycleView
        links={linksWithMetadata}
        sheetState={linkoutsState}
        theme={theme}
        activeIdx={activeIdx}
        onLinkClick={onLinkClick}
        ctaText={ctaText}
        ctaLink={ctaLink}
        onCtaClick={onCtaClick}
      />
    );
  }

  if (linkoutsState === "responsive") {
    // Responsive wide-card: single self-contained card, no Swiper (the card
    // body owns its own navigation). `isResponsive` handles layout internally.
    const current = linksWithMetadata[activeIdx ?? 0];
    if (!current) return null;
    return (
      <LinkCard
        data={current}
        sheetState={linkoutsState}
        theme={theme}
        onClick={() => onLinkClick?.(current.link, current.title ?? current.link)}
        ctaText={ctaText}
        ctaLink={ctaLink}
        onCtaClick={onCtaClick}
        responsiveState={responsiveState}
        showResponsiveGrid={showResponsiveGrid}
        forceOrientation={forceOrientation}
        ctaClassName={ctaClassName}
        forceFlexRatio={forceFlexRatio}
        hideThumb={hideThumb}
      />
    );
  }

  // Only `full-view` has a definite panel height; panel/expand-view are auto.
  const isFullHeightSheet = linkoutsState === "full-view";

  // Single-link shortcut: skip the Swiper wrapper. Its `height: 100%` slide
  // rules diverge from the auto-measure well (bare LinkCard); rendering
  // LinkCard directly here matches the well so there's no bottom gap.
  const only = linksWithMetadata.length === 1 ? linksWithMetadata[0] : undefined;
  if (only) {
    return (
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className={isFullHeightSheet ? "gencl:h-full gencl:w-full" : undefined}>
        <LinkCard
          data={only}
          sheetState={linkoutsState}
          theme={theme}
          onClick={() => onLinkClick?.(only.link, only.title ?? only.link)}
          ctaText={ctaText}
          ctaLink={ctaLink}
          onCtaClick={onCtaClick}
        />
      </div>
    );
  }

  return (
    // Stop pointerdown so the parent sheet's `setPointerCapture` doesn't
    // steal the swipe from this inner Swiper (it fell through to a click).
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={isFullHeightSheet ? "gencl:h-full gencl:w-full" : undefined}>
      <Swiper
        spaceBetween={spaceBetween ?? 0}
        slidesPerView={slidesPerView ?? 1}
        loop={links.length > 1}
        // `noSwiping={false}`: the panel wraps in `swiper-no-swiping` to stop
        // the OUTER feed Swiper, but Swiper v11's unscoped `closest()` check
        // also disabled this inner carousel — opt out so it owns its gesture.
        noSwiping={false}
        autoplay={false}
        // `autoHeight` sizes the container to the active slide; without it the
        // default `height: 100%` resolves to 0 inside auto-sized parents and
        // the body collapses. Off in full-height where `h-full` is definite.
        autoHeight={!isFullHeightSheet}
        onSwiper={(swiper) => {
          if (swiperRef) swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          onActiveIndexChange?.(swiper.realIndex);
        }}
        className={isFullHeightSheet ? "gencl:h-full gencl:w-full" : undefined}>
        {linksWithMetadata.map((data, idx) => (
          <SwiperSlide
            key={data.link ?? `link-${idx}`}
            className={isFullHeightSheet ? "gencl:h-full" : undefined}
            style={isFullHeightSheet ? { height: "100%" } : undefined}>
            <LinkCard
              data={data}
              sheetState={linkoutsState}
              theme={theme}
              onClick={() => onLinkClick?.(data.link, data.title ?? data.link)}
              ctaText={ctaText}
              ctaLink={ctaLink}
              onCtaClick={onCtaClick}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
