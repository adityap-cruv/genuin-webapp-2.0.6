import React from "react";

import { BottomBar } from "@cxr/controls/BottomBar";
import { ClickOverlay } from "@cxr/controls/ClickOverlay";
import { TopBar } from "@cxr/controls/TopBar";
import type { VideoBannerProps } from "@cxr/controls/control-layer.types";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { useOctoSplit } from "@cxr/providers/GenAIProvider";

/**
 * Banner video controls for 300x600 and 300x250 embed sizes.
 *
 * Click on the video area:
 * - isFullScreen=false → expand to fullscreen (onFullScreenClick)
 * - isFullScreen=true  → toggle play/pause (onPlayClick)
 */
export function DefaultControlLayer({
  isFullScreen,
  variant,
  item,
  tagDetails,
  dimensions,
  isActive,
  isMuted,
  isPlay,
  expandOnTap,
  hideChrome = false,
  onMuteClick,
  onPlayClick,
  onFullScreenClick,
}: VideoBannerProps): React.JSX.Element {
  const instanceId = useInstanceId();
  // panel-view / full-view (sheet owns the container): hide all player chrome
  // except the sheet itself. Guarded by isActive so inactive reels — which read
  // the same shared fraction — keep their chrome.
  const { splitActive } = useOctoSplit(isActive);
  return (
    <>
      {!splitActive && !hideChrome && (
        <TopBar
          variant={variant}
          isFullScreen={isFullScreen}
          isMuted={isMuted}
          isPlay={isPlay}
          isActive={isActive}
          onMuteClick={onMuteClick}
          onPlayClick={onPlayClick}
          onFullScreenClick={onFullScreenClick}
        />
      )}

      {/* Tap on the video area: non-fullscreen banner (300x250 / 300x600) →
          expand (expandOnTap); fullscreen → play/pause; otherwise unmute. */}
      {!splitActive && (
        <ClickOverlay
          isFullScreen={isFullScreen}
          expandOnTap={expandOnTap}
          onFullScreenClick={onFullScreenClick}
          onPlayClick={onPlayClick}
        />
      )}

      {!hideChrome && (
        <div className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:w-full">
          <BottomBar
            variant={variant}
            item={item}
            tagDetails={tagDetails}
            dimensions={dimensions}
            isActive={isActive}
            isFullScreen={isFullScreen}
            isMuted={isMuted}
            isPlay={isPlay}
            instanceId={instanceId}
            onMuteClick={onMuteClick}
            onPlayClick={onPlayClick}
          />
        </div>
      )}
    </>
  );
}
