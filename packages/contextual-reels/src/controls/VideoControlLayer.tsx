import React from "react";

import { AD_LAYOUT } from "@cxr/config";
import type { VideoControlLayerProps } from "@cxr/controls/control-layer.types";
import { DefaultControlLayer } from "@cxr/controls/video/DefaultControlLayer";
import { OctoSheet } from "@cxr/genai/octo/OctoSheet";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { useGenAI } from "@cxr/providers/GenAIProvider";
import { isCompactLayout } from "@cxr/utils/ads";

import { CompactControlBar } from "./CompactControlBar";
import { WatchButton } from "./buttons/atoms/WatchButton";
import { useNewPlayerControls } from "./useNewPlayerControls";

function stopProp(e: { stopPropagation(): void }): void {
  e.stopPropagation();
}

/**
 * Full-area unmute overlay for the compact 320x50 / 320x100 layouts.
 *
 * Mirrors the ad overlay behaviour: a tap anywhere on the compact surface
 * unmutes the video. Expanding happens only via the expand / Watch buttons,
 * which sit above this overlay (z-2 > z-1).
 */
export function CompactUnmuteOverlay({
  isMuted,
  onMuteClick,
}: {
  isMuted: boolean;
  onMuteClick: () => void;
}): React.JSX.Element {
  return (
    <div
      data-testid="compact-unmute-overlay"
      onClick={() => {
        if (isMuted) onMuteClick();
      }}
      onPointerDown={stopProp}
      onPointerMove={stopProp}
      onTouchStart={stopProp}
      onTouchMove={stopProp}
      className="gencl:absolute gencl:inset-0 gencl:z-1 gencl:bg-transparent gencl:cursor-pointer"
    />
  );
}

/**
 * VideoControlLayer — routes to the correct video control sub-component.
 *
 * Routing:
 * - mobile-320x50 / mobile-320x100 → VideoCompact (compact inline bar)
 * - isFullScreen === true           → VideoFullscreen (click = play/pause)
 * - all other sizes                 → VideoBanner (click = expand)
 */
export function VideoControlLayer({
  variant,
  item,
  tagDetails,
  dimensions,
  isActive,
  isFullScreen,
  isMuted,
  isPlay,
  adLayout,
  animatedBorder,
  onMuteClick,
  onPlayClick,
  onFullScreenClick,
}: VideoControlLayerProps): React.JSX.Element {
  // useInstanceId must be called unconditionally (hooks rules).
  const instanceId = useInstanceId();
  const { genAiEnabled } = useGenAI();
  const isCompact = isCompactLayout(adLayout);
  // iHeart stays on the legacy controls; everything else gets the V2 icon set.
  const isV2 = useNewPlayerControls() && variant !== "iheart";

  const tagId = tagDetails?.tag_id ?? "";
  const videoId = item.video?.id;
  const octoAllowed = !isFullScreen && genAiEnabled && Boolean(videoId);
  const stripProps = octoAllowed
    ? {
        instanceId,
        videoId: videoId as string,
        brandId: tagDetails?.brand_id,
        dimensions,
        isFullScreen,
        isActive,
        tagId,
        host: "compact" as const,
        adLayoutHint: adLayout,
      }
    : null;

  if (isCompact && !isFullScreen) {
    const is320x50 = adLayout === AD_LAYOUT.L3;

    // 320×50 + Octo allowed: Octo replaces the control bar entirely.
    if (is320x50 && stripProps) {
      return (
        <div
          data-testid="octo-compact-host"
          className="gencl:relative gencl:w-full gencl:h-full gencl:flex gencl:items-center gencl:gap-2 gencl:px-1">
          <CompactUnmuteOverlay isMuted={isMuted} onMuteClick={onMuteClick} />
          {stripProps && (
            <div className="gencl:flex gencl:items-center gencl:w-[226px]">
              <OctoSheet {...stripProps} />
            </div>
          )}
          <WatchButton
            isPlay={isPlay}
            onClick={onFullScreenClick}
            variant="pill"
            style={{ zIndex: 2, flexShrink: 0 }}
          />
        </div>
      );
    }

    return (
      <div className="gencl:relative gencl:w-full gencl:h-full gencl:overflow-hidden gencl:flex gencl:flex-col gencl:items-center">
        <CompactUnmuteOverlay isMuted={isMuted} onMuteClick={onMuteClick} />

        {/* Bar above the overlay (z-2 > z-1); the wrapper passes empty-area
            taps through to the unmute overlay, interactive rows opt back in.
            Sized intrinsically (shrink-0) so it leaves room for the Octo strip
            below — `h-full` here used to consume the whole column and clip it. */}
        <div className="gencl:relative gencl:z-2 gencl:w-full gencl:shrink-0 gencl:pointer-events-none">
          <CompactControlBar
            size={is320x50 ? "sm" : "md"}
            useV2Icons={isV2}
            identity={{ imageUrl: item.owner?.profile_image, name: item.owner?.nickname }}
            description={item.video?.description}
            // 320×50 video now shows a Watch button beside its ticker.
            showWatchInSm={is320x50}
            hideTickerAndActions={Boolean(stripProps)}
            animatedBorder={animatedBorder}
            isPlay={isPlay}
            isMuted={isMuted}
            isFullScreen={isFullScreen}
            onPlayClick={onPlayClick}
            onMuteClick={onMuteClick}
            onFullScreenClick={onFullScreenClick}
            onWatchClick={onFullScreenClick}
            className={is320x50 ? "gencl:gap-0" : ""}
          />
        </div>

        {/* OCTO LAYER — 320×100 strip below the row, taking the remaining height.
            OctoSheet self-resolves and renders null for 320×50 (handled above)
            and non-compact sizes. */}
        {stripProps && (
          <div className="gencl:relative gencl:z-2 gencl:w-full gencl:flex-1 gencl:min-h-0">
            <OctoSheet {...stripProps} />
          </div>
        )}
      </div>
    );
  }

  // Banner sizes expand to fullscreen on a video tap when not already fullscreen.
  const isBanner = adLayout === AD_LAYOUT.L2 || adLayout === AD_LAYOUT.L1;
  const expandOnTap = isBanner && !isFullScreen;

  // 300x250 mounts Octo as a full-size overlay over the playing video; there the
  // banner chrome is hidden so only the bare video (still tap-to-expand) shows.
  const hideChrome = adLayout === AD_LAYOUT.L2 && !isFullScreen && octoAllowed;

  return (
    <DefaultControlLayer
      isFullScreen={isFullScreen}
      variant={variant}
      item={item}
      tagDetails={tagDetails}
      dimensions={dimensions}
      isActive={isActive}
      isMuted={isMuted}
      isPlay={isPlay}
      expandOnTap={expandOnTap}
      hideChrome={hideChrome}
      onMuteClick={onMuteClick}
      onPlayClick={onPlayClick}
      onFullScreenClick={onFullScreenClick}
    />
  );
}
