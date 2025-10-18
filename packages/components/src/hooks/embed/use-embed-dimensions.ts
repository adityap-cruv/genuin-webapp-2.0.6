"use client";

import { useMemo, useEffect, useState } from "react";
import { useEmbedConfigs } from "./use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

export interface EmbedDimensions {
  containerHeight: number;
  containerWidth: number;
  headerHeight: number;
  statsHeight: number;
  linkoutHeight: number;
  spaceBetweenVideos: number;
  availableHeight: number;
}

export function useEmbedDimensions() {
  const embedContext = useSafeEmbedContext();
  const config = useEmbedConfigs();

  // State to hold observed dimensions as an object
  const [observedDimensions, setObservedDimensions] = useState<{
    width?: number;
    height?: number;
  }>({ width: undefined, height: undefined });

  useEffect(() => {
    const root = embedContext?.rootElement;
    if (!root) return;
    // Initial set
    setObservedDimensions({
      width: root.clientWidth,
      height: root.clientHeight,
    });
    // Observe size changes, in case of the embed-elements size changes we need to update the dimensions
    const resizeObserver = new ResizeObserver(() => {
      setObservedDimensions({
        width: root.clientWidth,
        height: root.clientHeight,
      });
    });
    resizeObserver.observe(root);
    return () => {
      resizeObserver.disconnect();
    };
  }, [embedContext?.rootElement]);

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
      if (!config.header.showHeader || (config.view.isPlacementView && !config.contentDisplay.showStyleDetails)) return 0;

      if (config.view.isFeed) {
        if (config.header.ctaButton?.url) {
          return HEADER_HEIGHTS.feed.withCtaButton;
        }
        return config.header.subHeading
          ? HEADER_HEIGHTS.feed.withSubHeading
          : HEADER_HEIGHTS.feed.basic;
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
    const statsHeight =
      config.engagement.showSocialInteractionData &&
      config.responsive.canShowEngagement
        ? 40
        : 0;
    const linkoutHeight =
      config.links.showLinkOutside &&
      config.responsive.canShowEngagement
        ? 108
        : 0;

    const containerHeight =
      observedDimensions.height ??
      config.dimensions.containerHeight ??
      DEFAULT_HEIGHT;
    const containerWidth =
      observedDimensions.width ??
      config.dimensions.containerWidth ??
      DEFAULT_WIDTH;

    const availableHeight = Math.max(
      containerHeight - headerHeight,
      MIN_CAROUSEL_HEIGHT
    );

    // For iheart brand layout, reserve space for navigation buttons below the embed
    const isIheartLayout = config.view.brandLayoutType === 'iheart';
    const navigationButtonHeight = 60; // Approximate height for navigation buttons
    const finalAvailableHeight = isIheartLayout
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
    };
  }, [
    config.dimensions.containerHeight,
    config.dimensions.containerWidth,
    config.header.showHeader,
    config.engagement.showSocialInteractionData,
    config.responsive.canShowEngagement,
    config.links.showLinkOutside,
    config.view.isFeed,
    config.view.brandLayoutType,
    observedDimensions.width,
    observedDimensions.height,
  ]);
}
