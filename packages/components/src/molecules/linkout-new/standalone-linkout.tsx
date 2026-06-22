"use client";

import type { CSSProperties, ReactNode } from "react";

import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { DynamicLinkouts } from "./linkouts-dynamic";
import { ResponsiveLinkCard, type FlexRatio } from "./responsive-card";

/**
 * Standalone wrapper around `<DynamicLinkouts view="responsive">` for
 * use in static grids and decks — pages where the host already
 * controls layout and just wants a single self-contained card cell.
 *
 * `<DynamicLinkouts>` itself is designed to be embedded inside the
 * feed/video stack where a `<DynamicSheet>` host controls sizing.
 * Using it directly inside a 1-fr grid cell causes the inner
 * `<ResponsiveLinkCard>` to render at an indeterminate size
 * (the auto-picker's ResizeObserver needs both axes to be definite).
 * This wrapper solves that by:
 *
 * 1. Wrapping the card in an explicitly sized container — pass
 *    `aspectRatio` (e.g. `"3 / 4"`, `"4 / 1"`) so the parent has a
 *    definite height the card can size to.
 * 2. Forcing the orientation deterministically — no reliance on the
 *    aspect-ratio auto-picker.
 * 3. Funnelling fixture wiring (analytics, isActive=true) into one
 *    place so callers don't repeat the boilerplate per cell.
 *
 * Hosts that need richer CTA styling pass `ctaClassName` — merged
 * onto the responsive card's CTA pill (`<ResponsiveCta>`).
 */
export interface StandaloneLinkoutProps {
  /** Single linkout to render. Use one card per `LinkData`. */
  link: LinkData;
  /** Page-level CTA copy. Defaults to the linkout's title. */
  ctaText?: string;
  /** Page-level CTA href. Defaults to `link.link`. */
  ctaLink?: string;
  /** Image-on-top (`"portrait"`) or image-left (`"landscape"`). */
  orientation: "portrait" | "landscape";
  /**
   * CSS `aspect-ratio` for the sized container — pick a value that
   * matches the orientation (e.g. `"3 / 4"` for portrait,
   * `"5 / 2"` for landscape mini-cards). Required so the inner
   * responsive card has a definite height to size against.
   */
  aspectRatio: CSSProperties["aspectRatio"];
  /** Forward to the responsive card's CTA pill (merged with the
   *  base `bg-secondary-900 text-white rounded-lg` styling). */
  ctaClassName?: string;
  /**
   * Forwarded to `<DynamicLinkouts>`'s `responsiveState`:
   * - `"default"` → title + image + CTA only (no description / chips).
   * - `"expand"` → everything, including the `description` field.
   * Defaults to `"default"` to match the existing `<DynamicLinkouts>`
   * default. Hosts that want a description rendered must pass
   * `"expand"`.
   */
  responsiveState?: "default" | "expand";
  /**
   * Override the responsive card's auto-picked thumb/details flex
   * ratio. Use this when a Figma reference needs a bigger image area
   * than the card's auto-sized bucket gives — e.g. `{ thumb: 3,
   * details: 1 }` for a 75/25 image-to-content split (matches the
   * "More styles" cards in Figma node 4842:148036). Forwarded
   * verbatim to `<ResponsiveLinkCard>`'s `forceFlexRatio`.
   */
  forceFlexRatio?: FlexRatio;
  /**
   * Suppress the card's image/thumb area entirely. Forwarded to
   * `<DynamicLinkouts>`'s `hideThumb`. Use when the host renders its
   * own preview (e.g. a sibling video player) above the card and only
   * the title/description/CTA block is needed.
   */
  hideThumb?: boolean;
  /**
   * Optional class merged onto the outer sized container — useful
   * for the host's grid placement (col-span, max-width, etc.) or
   * for tweaking the container's border / shadow.
   */
  className?: string;
  /** Optional inline style on the sized container. Merges after
   *  `aspectRatio` so callers can override or extend. */
  style?: CSSProperties;
  /** Optional content rendered after the card (e.g. a caption). */
  children?: ReactNode;
}

const DEFAULT_ANALYTICS = buildLinkoutsAnalyticsData({});

/**
 * Renders a single `<DynamicLinkouts view="responsive">` instance in
 * a host-controlled sized container. See `StandaloneLinkoutProps` for
 * the rationale.
 */
export function StandaloneLinkout({
  link,
  ctaText,
  ctaLink,
  orientation,
  aspectRatio,
  ctaClassName,
  responsiveState = "default",
  forceFlexRatio,
  hideThumb,
  className,
  style,
  children,
}: StandaloneLinkoutProps) {
  // When `hideThumb` is set, bypass the `<DynamicLinkouts>` →
  // `<LazyDynamicSheet>` plumbing entirely. The sheet enforces
  // `height: computedHeight` from `parentElement.clientHeight` with
  // `overflow: hidden`, so a thumb-less card (which has no aspect
  // ratio to drive a definite wrapper height) would collapse the
  // sheet to 0 and clip the content. Without a thumb the sheet adds
  // no value (no drag, no expand/collapse, no chrome), so render the
  // `<ResponsiveLinkCard>` directly and let it size to its content.
  if (hideThumb) {
    return (
      <div data-slot="standalone-linkout" className={className} style={style}>
        <ResponsiveLinkCard
          data={{
            link: link.link,
            title: link.title,
            image: link.image,
            brand: link.brand || undefined,
            website: link.website || undefined,
            description: link.description ?? undefined,
            originalPrice: link.originalPrice ?? undefined,
            currentPrice: link.currentPrice ?? undefined,
            rating: link.rating ?? undefined,
            likes: link.likes ?? undefined,
            downloads: link.downloads ?? undefined,
            phone: link.phone ?? undefined,
            address: link.address ?? undefined,
          }}
          state={responsiveState}
          ctaText={ctaText ?? link.title ?? link.link}
          ctaLink={ctaLink ?? link.link}
          forceOrientation={orientation}
          ctaClassName={ctaClassName}
          forceFlexRatio={forceFlexRatio}
          hideThumb
        />
        {children}
      </div>
    );
  }
  return (
    <div data-slot="standalone-linkout" className={className} style={{ aspectRatio, ...style }}>
      <DynamicLinkouts
        links={[link]}
        ctaText={ctaText ?? link.title ?? link.link}
        ctaLink={ctaLink ?? link.link}
        isActive
        view="responsive"
        responsiveState={responsiveState}
        forceOrientation={orientation}
        ctaClassName={ctaClassName}
        forceFlexRatio={forceFlexRatio}
        analyticsEventData={DEFAULT_ANALYTICS}
      />
      {children}
    </div>
  );
}
