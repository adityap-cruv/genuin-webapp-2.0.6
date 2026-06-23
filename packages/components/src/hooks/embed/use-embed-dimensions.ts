"use client";

import { useMemo, useEffect, useState } from "react";

import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

import { useEmbedConfigs } from "./use-embed-config";

export interface EmbedDimensions {
  containerHeight: number;
  containerWidth: number;
  headerHeight: number;
  statsHeight: number;
  linkoutHeight: number;
  spaceBetweenVideos: number;
  availableHeight: number;
}

/**
 * Last positive measurement per host element, kept across hook (re)mounts.
 *
 * `useEmbedDimensions` is used by both the skeleton and the GridView, and the
 * skeleton is also a Suspense fallback for the lazily-loaded GridView. When the
 * GridView chunk loads, the fallback skeleton unmounts and a fresh component
 * mounts — local state would reset to "unmeasured", flipping the dynamic grid
 * back to its plain-shimmer placeholder for a frame (the flicker). Seeding the
 * initial state from this cache keeps a remounted consumer already measured.
 */
const measuredDimensionsCache = new WeakMap<Element, { width: number; height: number }>();

export function useEmbedDimensions() {
  const embedContext = useSafeEmbedContext();
  const config = useEmbedConfigs();

  const root = embedContext?.rootElement ?? null;

  // State to hold observed dimensions as an object, seeded from the cache so a
  // remount (e.g. the Suspense fallback swap) starts already measured.
  const [observedDimensions, setObservedDimensions] = useState<{
    width?: number;
    height?: number;
  }>(() => (root && measuredDimensionsCache.has(root) ? measuredDimensionsCache.get(root)! : {}));

  useEffect(() => {
    if (!root) return;

    // Only commit real, positive measurements. In a shadow DOM the host can
    // report 0 before layout settles; storing that would size content to a
    // collapsed box and then jump once the real size arrives (a left-side
    // flicker for the dynamic grid). Skipping non-positive reads leaves the
    // dimensions undefined until the host genuinely has a size.
    const commitIfPositive = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (width > 0 && height > 0) {
        measuredDimensionsCache.set(root, { width, height });
        setObservedDimensions((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
      }
    };

    // Initial set
    commitIfPositive();
    // Observe size changes, in case of the embed-elements size changes we need to update the dimensions
    const resizeObserver = new ResizeObserver(commitIfPositive);
    resizeObserver.observe(root);
    return () => {
      resizeObserver.disconnect();
    };
  }, [root]);

  return useMemo(() => {
    const DEFAULT_HEIGHT = 100;
    const DEFAULT_WIDTH = 100;
    const spaceBetweenVideos = 8;
    const MIN_CAROUSEL_HEIGHT = 100;

    // Header height constants for different view types
    const HEADER_HEIGHTS = {
      feed: {
        withCtaButton: 104,
        withSubHeading: 64,
        basic: 40,
      },
      carousel: 56,
      grid: 48,
    } as const;

    // Calculate header height based on view type and configuration
    const getHeaderHeight = (): number => {
      if (
        !config.header.showHeader ||
        (config.view.isPlacementView && (!config.contentDisplay.showStyleDetails || !config.header.heading))
      )
        return 0;

      if (config.view.isFeed) {
        if (config.header.ctaButton?.url) {
          return HEADER_HEIGHTS.feed.withCtaButton;
        }
        return config.header.subHeading ? HEADER_HEIGHTS.feed.withSubHeading : HEADER_HEIGHTS.feed.basic;
      }

      if (config.view.isCarousel) {
        return HEADER_HEIGHTS.carousel;
      }

      if (config.view.isGrid) {
        return HEADER_HEIGHTS.grid;
      }

      return 0;
    };

    const headerHeight = getHeaderHeight();
    const statsHeight = config.engagement.showSocialInteractionData && config.responsive.canShowEngagement ? 40 : 0;
    const linkoutHeight =
      config.links.showLinkOutside && config.responsive.canShowEngagement
        ? config.responsive.effectiveVideoWidth > 300
          ? 154
          : 38
        : 0;

    const containerHeight = observedDimensions.height ?? config.dimensions.containerHeight ?? DEFAULT_HEIGHT;
    const containerWidth = observedDimensions.width ?? config.dimensions.containerWidth ?? DEFAULT_WIDTH;

    // True once the host has a real measured size. observedDimensions is only
    // ever set from a positive measurement (see the effect above), so a defined
    // width/height means the container has genuinely been laid out. Consumers
    // that size content off the container (e.g. the dynamic grid skeleton) wait
    // for this to avoid the collapsed-then-expand flicker.
    const isMeasured = observedDimensions.width != null && observedDimensions.height != null;

    const availableHeight = Math.max(containerHeight - headerHeight, MIN_CAROUSEL_HEIGHT);

    // For iheart brand layout in carousel view, reserve space for navigation buttons below the embed.
    // iheart handles its own nav button sizing, so navigationButtonHeight stays 0 for all iheart IDs.
    const isIheartCarouselLayout = config.view.brandLayoutType === "iheart" && config.view.isCarousel;
    const navigationButtonHeight = !isIheartCarouselLayout && config.view.isNavigationControlEnabled ? 68 : 0;
    const finalAvailableHeight = isIheartCarouselLayout
      ? Math.max(availableHeight - navigationButtonHeight, MIN_CAROUSEL_HEIGHT)
      : availableHeight;

    return {
      containerHeight,
      containerWidth,
      headerHeight,
      statsHeight,
      linkoutHeight,
      spaceBetweenVideos,
      availableHeight: finalAvailableHeight,
      isMeasured,
    };
  }, [
    config.engagement.showSocialInteractionData,
    config.responsive.canShowEngagement,
    config.responsive.effectiveVideoWidth,
    config.links.showLinkOutside,
    config.dimensions.containerHeight,
    config.dimensions.containerWidth,
    config.view.brandLayoutType,
    config.view.isCarousel,
    config.view.isNavigationControlEnabled,
    config.view.isPlacementView,
    config.view.isFeed,
    config.view.isGrid,
    config.header.showHeader,
    config.header.heading,
    config.header.ctaButton?.url,
    config.header.subHeading,
    config.contentDisplay.showStyleDetails,
    observedDimensions.height,
    observedDimensions.width,
  ]);
}
