"use client";

import { cn } from "@genuin/ui/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { lazy, Suspense, useId, type RefObject } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { useBaseContext } from "@genuin/components/context";
import type { SheetState } from "@genuin/components/context/base/event-bus";
import type {
  GenAdBannerConfig,
  GenAdConfig,
} from "@genuin/components/molecules/feed-player/gen-ad-container/gen-ad.types";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { LinkCard, type LinkMetaData } from "./link-card";
import type { FlexRatio } from "./responsive-card";

import "swiper/css";

// Lazy-load `<GenAdContainer>` so the GenAd SDK script isn't pulled
// into the linkout bundle for callers that never render the banner
// ad branch. Same pattern `<FeedPlayer>` uses for its full-frame
// ad overlay.
const GenAdContainer = lazy(() =>
  import("@genuin/components/molecules/feed-player/gen-ad-container").then((m) => ({
    default: m.GenAdContainer,
  }))
);

/** Stable no-op for `<GenAdContainer>`'s required `moveToNextVideo`
 *  callback. The linkout slot has no concept of "next video"; this
 *  is intentionally a noop so the SDK's completion handler doesn't
 *  trigger any feed behaviour. */
const noop = (): void => {};

// ─── AutoCycleView ─────────────────────────────────────────────────────────────
// One LinkCard at a time. Used for the chip and resting states
// (pl-xs / pl-sml / default). `default-active` and `expand-view`
// share the same composite body but render inside a Swiper so the
// user can swipe horizontally between links. The "auto-cycle" name
// is historical — auto rotation is currently disabled; navigation
// is driven from outside via the parent's controlled `activeIdx`.

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
  /** Forwarded to `<LinkCard>` so the `default` branch can render its
   *  inline CTA pill (Figma 8244-20303). The other AutoCycleView
   *  branches (`pl-xs` / `pl-sml` / `default-active`) ignore them. */
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
}: {
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  theme?: "light" | "dark";
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
// Pure-prop dots. Lives outside the sheet body so it sits on the video
// backdrop, below the panel — matching the Figma layout reference where
// `<Carousel>` is a sibling of the sheet content.
//
// `widthMode` mirrors Figma's two layouts: full-width for chip and
// collapsed states, fixed 334 px (centered) for expand-view.

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
  // Dot colours track the panel theme. Tokens map to the design
  // system hexes verified in `packages/tailwind-config/shared-styles.css`:
  //   Dark theme  → active `#767B81` (secondary-600), inactive `#E9EBEC` (secondary-100)
  //   Light theme → active `#585C61` (secondary-700), inactive `#DFE1E3` (secondary-150)
  // Light theme is used by the outside-layout placement
  // (Figma 10075:76988); dark stays the default for inside embed.
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
// Renders the body of the linkout sheet — either an AutoCycleView
// (single card at a time, for chip / default states) or a Swiper
// (for expand-view / panel-view / full-view).
//
// The dots and desktop nav buttons used to live inside this component;
// they've been split out as `<LinkoutCarouselDots>` / `<LinkoutNavButtons>`
// so the parent can render them outside the sheet panel.

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
  /** Page-level CTA props, forwarded to `<LinkCard>` for the
   *  `default` state's inline CTA pill (Figma 8244-20303). */
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
  /** Forwarded to `<LinkCard>`'s `isResponsive` branch — picks
   *  between the wide card's "default" (hide desc + chips) and
   *  "expand" (show all) content states. */
  responsiveState?: "default" | "expand";
  /** Storybook-only debug overlay for the responsive card. */
  showResponsiveGrid?: boolean;
  /**
   * In-linkout banner ad. When supplied, the link path is bypassed
   * entirely and a `<GenAdContainer>` is rendered in place of the
   * `<LinkCard>` with a banner-only `GenAdConfig`. The container is
   * sized exactly to `bannerAd.config.size`; the sheet's `default`
   * scenario panel handles the dark translucent chrome (Figma
   * `Component 3` at node 9563:113378) — `<DynamicLinkouts>`
   * overrides `initialState` / `enabledStates` to keep the slot
   * locked to `default` while the ad is shown.
   */
  bannerAd?: {
    config: GenAdBannerConfig;
    brandId?: string;
    /** Optional override for the SDK's analytics `ad_type` field.
     *  Defaults to `"linkout_banner"` so consumers can disambiguate
     *  events emitted from this slot vs the `<FeedPlayer>` overlay. */
    adType?: string;
  };
  /** Forwarded to `<LinkCard>` → `<ResponsiveLinkCard>` to pin the
   *  responsive card's orientation when auto-detection is unwanted. */
  forceOrientation?: "portrait" | "landscape";
  /** Forwarded to `<LinkCard>` → `<ResponsiveLinkCard>`'s CTA pill —
   *  extra classes merged onto the existing CTA styling. */
  ctaClassName?: string;
  /** Forwarded to `<LinkCard>` → `<ResponsiveLinkCard>` — overrides
   *  the auto-picked thumb/details flex ratio for hosts that need
   *  a deterministic image vs. text split. */
  forceFlexRatio?: FlexRatio;
  /** Forwarded to `<LinkCard>` → `<ResponsiveLinkCard>` — skip the
   *  thumb area when the host renders its own preview above the
   *  card. */
  hideThumb?: boolean;
}) {
  const { brandDetails } = useBaseContext();
  // `useId` is allowed before the early return because hooks run on
  // every render regardless of which branch we end up in.
  const generatedAdSlotId = useId();

  if (bannerAd) {
    // Banner ad branch — replaces the link card entirely. The
    // `<GenAdContainer>` mounts inside the same dynamic-sheet panel
    // the link card normally fills (see Figma `Component 3` at
    // 9563:113378). The container's render output is absolutely
    // positioned to fill its parent, so a relatively-positioned
    // wrapper sized to the chosen banner is sufficient.
    const adConfig: GenAdConfig = {
      adSlotId: `linkout-banner-${generatedAdSlotId.replace(/[:]/g, "-")}`,
      banner: bannerAd.config,
      ...(bannerAd.brandId ? { brandDetails: { brandId: bannerAd.brandId } } : {}),
    };
    return (
      // Outer padded wrapper — adds the 4 px grey gap around the
      // banner that Figma `Component 3` (9563:113782) shows. The
      // panel's translucent dark fill comes from the dynamic-sheet
      // chrome below (it's `bg-black/50 + backdrop-blur` by default
      // in dark theme), so we just need the padding here. The inner
      // box stays at the exact banner dimensions.
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
          <Suspense fallback={null}>
            <GenAdContainer
              config={adConfig}
              isActive
              isVisible
              // The linkout slot has no concept of "next video" — the
              // SDK invokes this when the ad completes; we no-op so
              // the slot just becomes empty (or whatever the host's
              // upstream waterfall decides next).
              moveToNextVideo={noop}
              // Disambiguate analytics from `<FeedPlayer>`'s in-feed
              // overlay events. The SDK forwards `ad_type` into every
              // tracking payload via `videoType`.
              videoType={bannerAd.adType ?? "linkout_banner"}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  const linksWithMetadata: LinkMetaData[] = links.map((l) => ({
    link: l.link,
    title: l.title,
    image: l.image ?? brandDetails.logo,
    // Per-link brand/website override the brandDetails fallback when the
    // payload supplies them (Figma's design data is per-product, not
    // per-brand).
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
    // Chip + resting `default` state render a single card at a time
    // (no horizontal slider). Chips intentionally let touchmove bubble
    // to the host carousel; `default` is the resting row that auto-
    // advances to `expand-view` after 3 s, so the swipe window is too
    // short to be useful. Pagination dots live in the parent so they
    // sit on the video backdrop, below the panel.
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
    // Responsive wide-card: single self-contained card per active
    // link (no Swiper — the host frame already controls navigation
    // through its own dots inside the card body). LinkCard's
    // `isResponsive` branch handles the size buckets, orientation,
    // and overflow cascade internally.
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

  // Only `full-view` has a definite panel height (100% of container)
  // and uses `h-full justify-between` to bottom-align the image +
  // meta block. `panel-view` is auto-sized to its content, and
  // `expand-view` is also auto — both leave Swiper at its default
  // height so the slide just wraps the LinkCard's intrinsic size.
  const isFullHeightSheet = linkoutsState === "full-view";

  return (
    <Swiper
      spaceBetween={0}
      slidesPerView={1}
      loop={links.length > 1}
      // Autoplay was previously gated on `default` / `default-active`,
      // but `default` early-returns into AutoCycleView and `default-
      // active` / `expand-view` / `panel-view` / `full-view` are
      // user-driven horizontal swipe carousels.
      autoplay={false}
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
  );
}
