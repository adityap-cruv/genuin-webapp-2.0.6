"use client";

import type { EmblaCarouselType } from "embla-carousel";
import React, { type RefObject } from "react";

import { NavArrowButton } from "@cxr/controls/buttons/atoms/NavArrowButton";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { resolveCxrControlSize } from "@cxr/controls/control-size";
import { useNewPlayerControls } from "@cxr/controls/useNewPlayerControls";
import { useOptionalAdWaterfall } from "@cxr/providers/AdProvider";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";

const SHOW_FEED_NAV_BUTTONS = true;

export interface FeedNavButtonsProps {
  /** Live Embla API ref from useEmblaCarousel. */
  emblaApiRef: RefObject<EmblaCarouselType | null>;
  /** Control-layer variant — iHeart stays on V1 (no V2 chevrons). */
  variant?: ControlLayerVariant;
}

/** V2-only up/down nav arrows on the right edge of the feed. Returns null for V1. */
export function FeedNavButtons({ emblaApiRef, variant }: FeedNavButtonsProps): React.JSX.Element | null {
  const isV2 = useNewPlayerControls() && variant !== "iheart";
  const adLayout = useOptionalAdWaterfall()?.adLayout;
  const { isFullScreen } = useFullScreen();
  if (!SHOW_FEED_NAV_BUTTONS) return null;
  if (!isV2) return null;
  // Only render in the fullscreen player — hidden in every collapsed/embed view.
  if (!isFullScreen) return null;

  // Per-layout sizing.
  const navSize = resolveCxrControlSize(adLayout, isFullScreen);

  return (
    <div
      data-testid="feed-nav-buttons"
      onClick={(e) => e.stopPropagation()}
      // Far-right edge of the player, clear of the action-rail column.
      className="gencl:absolute gencl:right-4 gencl:top-1/2 gencl:z-[80] gencl:flex gencl:-translate-y-1/2 gencl:flex-col gencl:gap-3">
      <NavArrowButton direction="up" size={navSize} onClick={() => emblaApiRef.current?.scrollPrev()} />
      <NavArrowButton direction="down" size={navSize} onClick={() => emblaApiRef.current?.scrollNext()} />
    </div>
  );
}
