"use client";

import { AD_LAYOUT } from "@cxr/config";
import { AdControlBar } from "@cxr/controls/ad/AdControlBar";
import type { AdControlLayerProps } from "@cxr/controls/control-layer.types";
import { isCompactLayout } from "@cxr/utils/ads";

/**
 * AdControlLayer — routes to the correct ad control sub-component based on embed size.
 */
export function AdControlLayer({
  isPlay,
  isMuted,
  isFullScreen,
  isFullScreenSupported,
  adLayout,
  isAdReady,
  ctaDetails,
  onPlayClick,
  onMuteClick,
  onFullScreenClick,
}: AdControlLayerProps) {
  const isCompact = isCompactLayout(adLayout);

  // Don't show controls until the per-slot waterfall has settled (fill or no-fill).
  // isAdReady resets per-slide via destroySignal, so this works correctly for every slide.
  if (!isAdReady) return null;

  if (isCompact && !isFullScreen) {
    const layout = (adLayout === AD_LAYOUT.L3 ? "320x50" : "320x100") as "320x50" | "320x100";
    // 320×100 (L4): GenAd renders its creative thumbnail into the left
    // `aspect-9/16` box of the slot (mirroring video's renderL4, which pins a
    // 100px-tall 9/16 player column on the left). Without a matching left
    // reservation our control chrome spans the full width and the Watch /
    // Learn-More row paints over GenAd's thumbnail. Reserve the same left
    // column here so the controls live only in the right area — identical to
    // how VideoLayout leaves the left space free for the video element.
    // 320×50 (L3) has no thumbnail column, so it stays full-width.
    const reserveThumbnailColumn = adLayout === AD_LAYOUT.L4;
    return (
      <div className="gencl:relative gencl:h-full gencl:w-full">
        {/* Bar sits above the overlay (z-[2] > overlay z-[1]) so real button taps reach their own
            onClick and never bubble to the tap-to-fullscreen overlay. The bar wrapper itself is
            pointer-events-none so taps on its empty area still fall through to the overlay below;
            interactive rows inside re-enable pointer-events. */}
        <div className="gencl:relative gencl:z-[2] gencl:h-full gencl:w-full gencl:pointer-events-none gencl:flex">
          {reserveThumbnailColumn && (
            // Spacer matching GenAd's left thumbnail box: 100px tall × 9/16.
            <div className="gencl:h-full gencl:shrink-0 gencl:aspect-9/16" aria-hidden />
          )}
          <div className="gencl:flex-1 gencl:min-w-0 gencl:h-full">
            <AdControlBar
              isPlay={isPlay}
              isMuted={isMuted}
              isFullScreen={isFullScreen}
              isFullScreenSupported={isFullScreenSupported}
              layout={layout}
              ctaDetails={ctaDetails}
              onPlayClick={onPlayClick}
              onMuteClick={onMuteClick}
              onFullScreenClick={onFullScreenClick}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gencl:h-full gencl:w-full">
      <AdControlBar
        isPlay={isPlay}
        isMuted={isMuted}
        isFullScreen={isFullScreen}
        isFullScreenSupported={isFullScreenSupported}
        layout="default"
        ctaDetails={ctaDetails}
        onPlayClick={onPlayClick}
        onMuteClick={onMuteClick}
        onFullScreenClick={onFullScreenClick}
      />
    </div>
  );
}
