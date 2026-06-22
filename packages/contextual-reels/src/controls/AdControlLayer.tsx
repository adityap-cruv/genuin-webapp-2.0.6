"use client";

import { ClickOverlay } from "@cxr/controls/ClickOverlay";
import { AdControlBar } from "@cxr/controls/ad/AdControlBar";
import { CompactControlBarOld } from "@cxr/controls/buttons/ControlButtons";
import type { AdControlLayerProps } from "@cxr/controls/control-layer.types";
import { isCompactLayout } from "@cxr/utils/ads";

/**
 * AdControlLayer — routes to the correct ad control sub-component based on embed size.
 *
 * variant="new" uses AdControlBar with layout routing.
 * variant="old" uses the legacy CompactControlBarOld for compact sizes.
 */
export function AdControlLayer({
  isPlay,
  isMuted,
  isFullScreen,
  adLayout,
  isAdReady,
  ctaDetails,
  onPlayClick,
  onMuteClick,
  onFullScreenClick,
  containerId,
  variant = "new",
}: AdControlLayerProps) {
  const isCompact = isCompactLayout(adLayout);

  // Don't show controls until the per-slot waterfall has settled (fill or no-fill).
  // isAdReady resets per-slide via destroySignal, so this works correctly for every slide.
  if (!isAdReady) return null;

  if (isCompact && !isFullScreen && variant === "new") {
    const layout = (adLayout === "mobile-320x50" ? "320x50" : "320x100") as "320x50" | "320x100";
    return (
      <div className="gencl:relative gencl:h-full gencl:w-full">
        {/* Bar sits above the overlay (z-[2] > overlay z-[1]) so real button taps reach their own
            onClick and never bubble to the tap-to-fullscreen overlay. The bar wrapper itself is
            pointer-events-none so taps on its empty area still fall through to the overlay below;
            interactive rows inside re-enable pointer-events. */}
        <div className="gencl:relative gencl:z-[2] gencl:h-full gencl:w-full gencl:pointer-events-none">
          <AdControlBar
            isPlay={isPlay}
            isMuted={isMuted}
            isFullScreen={isFullScreen}
            layout={layout}
            ctaDetails={ctaDetails}
            onPlayClick={onPlayClick}
            onMuteClick={onMuteClick}
            onFullScreenClick={onFullScreenClick}
          />
        </div>
        {/* <ClickOverlay
          isFullScreen={isFullScreen}
          onFullScreenClick={onFullScreenClick}
          onPlayClick={onPlayClick}
          containerId={containerId}
        /> */}
      </div>
    );
  }

  if (isCompact && !isFullScreen && variant === "old") {
    return (
      <div className="gencl:relative gencl:h-full gencl:w-full">
        {/* See note above: raise the bar above the overlay; transparent areas pass clicks through. */}
        <div className="gencl:relative gencl:z-[2] gencl:h-full gencl:w-full gencl:pointer-events-none">
          <CompactControlBarOld isPlay={isPlay} isMuted={isMuted} onPlayClick={onPlayClick} onMuteClick={onMuteClick} />
        </div>
        {/* <ClickOverlay
          isFullScreen={isFullScreen}
          onFullScreenClick={onFullScreenClick}
          onPlayClick={onPlayClick}
          containerId={containerId}
        /> */}
      </div>
    );
  }

  return (
    <div className="gencl:h-full gencl:w-full">
      <AdControlBar
        isPlay={isPlay}
        isMuted={isMuted}
        isFullScreen={isFullScreen}
        layout="default"
        ctaDetails={ctaDetails}
        onPlayClick={onPlayClick}
        onMuteClick={onMuteClick}
        onFullScreenClick={onFullScreenClick}
      />
      {/* {!isFullScreen && (
        <ClickOverlay
          isFullScreen={isFullScreen}
          onFullScreenClick={onFullScreenClick}
          onPlayClick={onPlayClick}
          containerId={containerId}
          allowUnmute={false}
        />
      )} */}
    </div>
  );
}
