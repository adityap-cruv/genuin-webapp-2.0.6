import React from "react";

import { assetLink } from "@cxr/config";
import type { BottomBarSubProps } from "@cxr/controls/control-layer.types";
import type { NormalisedReel, TagResponse } from "@cxr/types";

/**
 * Gradient overlay rendered inside the video (position:absolute) showing
 * owner profile and description above the fixed icon strip.
 *
 * `paddingBottom` is set to 72px to clear the height of the fixed strip.
 */
function InVideoOverlay({ item, tagDetails }: { item: NormalisedReel; tagDetails: TagResponse }): React.JSX.Element {
  const showOwner = Boolean(tagDetails?.config?.show_owner_details);

  const thumb = item.owner?.profile_image ?? item.user?.thumb;
  const avatarBase = `${assetLink}assets/avatar/`;
  const profileImgSrc = thumb?.startsWith("https://") ? thumb : thumb ? `${avatarBase}${thumb}.gif` : undefined;
  const profileLink = item.owner?.share_string ?? "";

  return (
    <div
      data-testid="fullscreen-in-video-overlay"
      className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:w-full gencl:z-[10] gencl:pb-[10px] gencl:box-border"
      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)" }}>
      <div className="gencl:p-4">
        {showOwner && item.owner && (
          <a
            href={profileLink}
            data-testid="owner-profile-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="gencl:flex gencl:items-center gencl:gap-2 gencl:no-underline">
            {profileImgSrc && (
              <img
                src={profileImgSrc}
                className="gencl:w-9 gencl:h-9 gencl:rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `${avatarBase}penguin.gif`;
                }}
                alt={item.owner.nickname ?? ""}
              />
            )}
            <p className="gencl:text-[14px] gencl:leading-5 gencl:text-white gencl:m-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap">
              {item.owner.nickname}
            </p>
          </a>
        )}
        {item.video?.description && (
          <p
            className="gencl:text-white gencl:text-[13px] gencl:mt-[6px] gencl:overflow-hidden gencl:break-words gencl:m-0"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
            {item.video.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * YouTube-style fullscreen bottom bar used only for the `default` variant
 * when `isFullScreen=true`.
 *
 * Renders two children:
 * 1. A `position:fixed` icon strip at the bottom of the viewport (outside the player).
 * 2. A gradient overlay inside the video showing owner profile + description.
 *
 * @param props  BottomBarSubProps
 */
export function FullscreenBottomBar({ item, tagDetails }: BottomBarSubProps): React.JSX.Element {
  return (
    <div data-testid="fullscreen-bottom-bar">
      {/* <FixedIconStrip
        config={tagDetails?.config}
        isMuted={isMuted}
        isPlay={isPlay}
        onMuteClick={onMuteClick}
        onPlayClick={onPlayClick}
      /> */}
      <InVideoOverlay item={item} tagDetails={tagDetails} />
    </div>
  );
}
