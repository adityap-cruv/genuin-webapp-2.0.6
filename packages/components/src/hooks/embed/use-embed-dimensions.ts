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

export interface EmbedDimensionsProps {
  containerWidth?: number;
  containerHeight?: number;
}

export function useEmbedDimensions(
  config: ReturnType<typeof useEmbedConfigs>,
  props: EmbedDimensionsProps = {}
): EmbedDimensions {
  const embedContext = useSafeEmbedContext();
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

  props.containerWidth = observedDimensions.width ?? props.containerWidth;
  props.containerHeight = observedDimensions.height ?? props.containerHeight;
  return useMemo(() => {
    const DEFAULT_HEIGHT = 100;
    const DEFAULT_WIDTH = 100;
    const spaceBetweenVideos = 8;
    const MIN_CAROUSEL_HEIGHT = 100;

    const headerHeight = config.header.showHeader
      ? config.view.isFeed
        ? 104
        : 56
      : 0;
    const statsHeight = config.engagement.showSocialInteractionData ? 40 : 0;
    const linkoutHeight = config.links.showLinkOutside ? 108 : 0;

    const containerHeight =
      props.containerHeight ??
      config.dimensions.containerHeight ??
      DEFAULT_HEIGHT;
    const containerWidth =
      props.containerWidth ?? config.dimensions.containerWidth ?? DEFAULT_WIDTH;

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
    props.containerHeight,
    props.containerWidth,
    config.dimensions.containerHeight,
    config.dimensions.containerWidth,
    config.header.showHeader,
    config.engagement.showSocialInteractionData,
    config.links.showLinkOutside,
    config.view.isFeed,
    observedDimensions.width,
    observedDimensions.height,
  ]);
}
