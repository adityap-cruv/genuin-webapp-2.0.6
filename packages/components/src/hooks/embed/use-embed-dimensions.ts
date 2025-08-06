"use client";

import { useMemo } from "react";
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

export function useEmbedDimensions(
  config: ReturnType<typeof useEmbedConfigs>,
  measuredHeaderHeight: number = 0
): EmbedDimensions {
  return useMemo(() => {
    const DEFAULT_HEIGHT = 480;
    const DEFAULT_WIDTH = 320;
    const spaceBetweenVideos = 8;
    const MIN_CAROUSEL_HEIGHT = 200;

    const headerHeight =
      measuredHeaderHeight || (config.header.showHeader ? 56 : 0);

    const statsHeight = config.engagement.showSocialInteractionData ? 40 : 0;
    const linkoutHeight = config.links.showLinkOutside ? 108 : 0;

    const containerHeight = config.dimensions.containerHeight ?? DEFAULT_HEIGHT;
    const containerWidth = config.dimensions.containerWidth ?? DEFAULT_WIDTH;

    const availableHeight = Math.max(
      containerHeight - headerHeight - statsHeight - linkoutHeight,
      MIN_CAROUSEL_HEIGHT
    );

    return {
      containerHeight,
      containerWidth,
      headerHeight,
      statsHeight,
      linkoutHeight,
      spaceBetweenVideos,
      availableHeight,
    };
  }, [
    config.dimensions.containerHeight,
    config.dimensions.containerWidth,
    config.header.showHeader,
    config.engagement.showSocialInteractionData,
    config.links.showLinkOutside,
    config.view.isFeed,
    measuredHeaderHeight,
  ]);
}

/**
 * Utility to determine the embed variant based on config
 */
export function getEmbedVariant(
  config: ReturnType<typeof useEmbedConfigs>,
  variantProp?: "feed" | "carousel" | null | undefined
): "feed" | "carousel" {
  const configVariant = config.view.isFeed ? "feed" : "carousel";
  return (variantProp as "feed" | "carousel") || configVariant;
}
