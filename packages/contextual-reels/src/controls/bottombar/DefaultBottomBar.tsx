"use client";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { ShareIcon, SparkIcon } from "@genuin/ui/icons";
import React, { lazy } from "react";

import { assetLink } from "@cxr/config";
import type { BottomBarSubProps, ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { useGenAI, useOctoSplit } from "@cxr/providers/GenAIProvider";
import type { NormalisedReel, TagResponse } from "@cxr/types";
import { copyToClipboard, openShareLink } from "@cxr/utils/share";

const OctoSheet = lazy(() => import("../../genai/octo/OctoSheet").then((m) => ({ default: m.OctoSheet })));

/** Returns true for the 300×250 ad unit format — uses reduced sizing. */
function isSmallDimensions(dimensions: { width: number; height: number }): boolean {
  return dimensions.width === 300 && dimensions.height === 250;
}

const iconButtonCls =
  "gencl:border-0 gencl:bg-transparent gencl:p-0 gencl:cursor-pointer gencl:flex gencl:items-center gencl:justify-center";

/**
 * Owner profile row rendered on the left side of the bar.
 *
 * Conditionally rendered when `show_owner_details=true` and `item.owner` exists.
 */
function ProfileRow({
  item,
  tagDetails,
  dimensions,
  isFullScreen,
}: {
  item: NormalisedReel;
  tagDetails: TagResponse;
  dimensions: { width: number; height: number };
  isFullScreen: boolean;
}): React.JSX.Element | null {
  const showOwner = Boolean(tagDetails?.config?.show_owner_details);
  if (!showOwner || !item.owner) return null;

  const isSmall = isSmallDimensions(dimensions);
  const playerHeight = isFullScreen && typeof window !== "undefined" ? window.innerHeight : dimensions.height;
  const iconSize = Math.min(28, Math.floor(playerHeight * 0.08));
  const userIdFontSize = Math.min(12, Math.floor(playerHeight * 0.03));

  const thumb = item.owner?.profile_image ?? item.user?.thumb;
  const avatarBase = `${assetLink}assets/avatar/`;
  const profileImgSrc = thumb?.startsWith("https://") ? thumb : thumb ? `${avatarBase}${thumb}.gif` : undefined;
  const profileLink = item.owner?.share_string ?? "";

  return (
    <a
      href={profileLink}
      data-testid="owner-profile-link"
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="gencl:flex gencl:items-center gencl:gap-2 gencl:no-underline">
      {profileImgSrc && (
        <img
          src={profileImgSrc}
          className="gencl:rounded-full gencl:shrink-0"
          style={{
            width: isSmall ? "28px" : `${iconSize}px`,
            height: isSmall ? "28px" : `${iconSize}px`,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${avatarBase}penguin.gif`;
          }}
          alt={item.owner.nickname ?? ""}
        />
      )}
      <p
        className="gencl:text-white gencl:m-0 gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap"
        style={{
          fontSize: isSmall ? "12px" : `${userIdFontSize}px`,
          lineHeight: isSmall ? "24px" : `${userIdFontSize + 4}px`,
        }}>
        {item.owner.nickname}
      </p>
    </a>
  );
}

/**
 * Vertical column of icon action buttons.
 *
 * - `iheart` variant: always shows all 4 — spark, share, mute, play —
 *   regardless of `show_spark`/`show_share` config.
 * - `default` variant: shows spark?/share? only, gated by
 *   `config.show_spark`/`config.show_share`.
 *
 * All button clicks stop propagation before invoking their callback.
 */
function IconButtons({
  config,
  variant,
  isMuted,
  isPlay,
  shareUrl,
  onMuteClick,
  onPlayClick,
}: {
  config: TagResponse["config"];
  variant?: ControlLayerVariant;
  isMuted: boolean;
  isPlay: boolean;
  shareUrl?: string;
  onMuteClick: () => void;
  onPlayClick: () => void;
}): React.JSX.Element {
  const isIheart = variant === "iheart";
  const muteSrc = isMuted
    ? `${assetLink}reactions/iheartmedia/cxr/mute.svg`
    : `${assetLink}reactions/iheartmedia/cxr/unmute.svg`;
  const playSrc = isPlay
    ? `${assetLink}reactions/iheartmedia/cxr/pause.svg`
    : `${assetLink}reactions/iheartmedia/cxr/play.svg`;

  return (
    <div className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-5 gencl:shrink-0">
      {(isIheart || config?.show_spark) && (
        <button
          data-testid="bottombar-spark"
          aria-label="Spark"
          className={iconButtonCls}
          onClick={(e) => {
            e.stopPropagation();
            openShareLink(shareUrl);
          }}>
          {isIheart ? (
            <img
              src={`${assetLink}reactions/iheartmedia/cxr/like.svg`}
              style={{ width: "24px", height: "24px" }}
              alt="Spark"
            />
          ) : (
            <SparkIcon theme="dark" size="lg" />
          )}
        </button>
      )}
      {isIheart && (
        <button
          data-testid="bottombar-play"
          aria-label={isPlay ? "Pause" : "Play"}
          className={iconButtonCls}
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick();
          }}>
          <img src={playSrc} style={{ width: "24px", height: "24px" }} alt="Play toggle" />
        </button>
      )}
      {isIheart && (
        <button
          data-testid="bottombar-mute"
          aria-label={isMuted ? "Unmute" : "Mute"}
          className={iconButtonCls}
          onClick={(e) => {
            e.stopPropagation();
            onMuteClick();
          }}>
          <img src={muteSrc} style={{ width: "24px", height: "24px" }} alt="Mute toggle" />
        </button>
      )}
      {(isIheart || config?.show_share) && (
        <button
          data-testid="bottombar-share"
          aria-label="Share"
          className={iconButtonCls}
          onClick={(e) => {
            e.stopPropagation();
            void copyToClipboard(shareUrl ?? "");
          }}>
          {isIheart ? (
            <img
              src={`${assetLink}reactions/iheartmedia/cxr/share.svg`}
              style={{ width: "24px", height: "24px" }}
              alt="Share"
            />
          ) : (
            <ShareIcon theme="dark" size="lg" />
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Instagram-style bottom bar for the `default` and `iheart` variants.
 *
 * Layout:
 * - Left: profile (avatar + username) -> Octo sheet -> video description
 * - Right: spark?, share? (vertical icon column)
 * - Below: CTA button + ad-copy / OG link preview
 *
 * @param props  BottomBarSubProps
 */
export function DefaultBottomBar({
  variant,
  item,
  tagDetails,
  dimensions,
  isActive,
  isFullScreen,
  isMuted,
  isPlay,
  instanceId,
  onMuteClick,
  onPlayClick,
}: BottomBarSubProps): React.JSX.Element {
  const { genAiEnabled } = useGenAI();
  const isSmall = isSmallDimensions(dimensions);
  // In fullscreen, compact layouts (320x50/320x100) skip the ResizeObserver, so
  // `dimensions` is {0,0} — fall back to the viewport height (mirrors ProfileRow)
  // so the derived font sizes don't collapse to 0px and hide the description.
  const playerHeight = isFullScreen && typeof window !== "undefined" ? window.innerHeight : dimensions.height;

  // panel-view / full-view: the sheet owns the container — hide every bar
  // element except the OctoSheet itself. Guarded by isActive so inactive reels
  // (which read the same shared fraction) keep their bar content.
  const { splitActive } = useOctoSplit(isActive);

  const showCta = Boolean(tagDetails?.config?.show_cta ?? tagDetails?.show_cta);
  const adCopyText = item?.cta?.ad_copy ?? tagDetails?.cta?.ad_copy;
  const ogDetails = item.playerType === "pip" ? null : item.ogDetails;

  const ctaColor = tagDetails?.cta?.color ?? "#c6002b";
  const ctaLink = item?.cta?.link ?? tagDetails?.cta?.link ?? "https://begenuin.com/";
  const ctaText = item?.cta?.text ?? tagDetails?.cta?.text ?? "Learn More";
  const ctaTextColor = tagDetails?.cta?.text_color ?? "white";

  const pad = isFullScreen ? "16px" : "12px";
  const adFontSize = isSmall ? "12px" : `${Math.min(14, Math.floor(playerHeight * 0.026))}px`;
  const adLineHeight = isSmall ? "16px" : `${Math.min(19, Math.floor(playerHeight * 0.036))}px`;

  return (
    <div
      data-testid="default-bottom-bar"
      className="gencl:relative gencl:flex gencl:flex-col gencl:gap-[10px]"
      style={{
        // No gradient backdrop in split states — the sheet owns the surface.
        background: splitActive ? "none" : "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
        padding: splitActive ? 0 : `12px ${pad} ${pad}`,
      }}>
      {/* Body row: left = profile -> octo -> description, right = action icons (non-fullscreen only) */}
      <div className="gencl:flex gencl:items-end gencl:gap-2">
        <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:min-w-0 gencl:flex-1 gencl:z-[10]">
          {!splitActive && (
            <ProfileRow item={item} tagDetails={tagDetails} dimensions={dimensions} isFullScreen={isFullScreen} />
          )}

          {/* Single Octo gate: only allowed tags mount the lazy OctoSheet, so the
              octo chunk (and the GenAI SDK it pulls) is never fetched otherwise. */}
          {genAiEnabled && item.video?.id && (
            <SafeSuspense fallback={null}>
              <OctoSheet
                instanceId={instanceId}
                videoId={item.video.id}
                brandId={tagDetails?.brand_id}
                dimensions={dimensions}
                isFullScreen={isFullScreen}
                isActive={isActive}
                tagId={tagDetails?.tag_id ?? ""}
                host="bottombar"
              />
            </SafeSuspense>
          )}

          {!splitActive && item.video?.description && (
            <p
              className="gencl:text-white gencl:m-0 gencl:overflow-hidden gencl:break-words"
              style={{
                fontSize: adFontSize,
                lineHeight: adLineHeight,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
              {item.video.description}
            </p>
          )}
        </div>

        {/*
          Right-side action column (spark?, share?) — non-fullscreen only.
          Sits inline at the end of the body row, bottom-aligned with the left column.
          In fullscreen the rail is rendered at the feed backdrop level (see
          FullscreenActionRail in Feed.tsx) so it can sit in the black margin outside the
          Embla transform subtree, which would otherwise trap it.
        */}
        {(!isFullScreen || variant === "iheart") && !splitActive && (
          <div data-testid="bottombar-actions" className="gencl:z-[10]">
            <IconButtons
              config={tagDetails?.config}
              variant={variant}
              isMuted={isMuted}
              isPlay={isPlay}
              shareUrl={item.video?.share_string}
              onMuteClick={onMuteClick}
              onPlayClick={onPlayClick}
            />
          </div>
        )}
      </div>

      {/* CTA button */}
      {!splitActive && showCta && (
        <div data-testid="bottombar-cta">
          <a
            href={ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="gencl:flex gencl:items-center gencl:justify-center gencl:w-full gencl:no-underline gencl:rounded-[30px]"
            style={{
              height: isSmall ? "36px" : isFullScreen ? "40px" : "32px",
              backgroundColor: ctaColor,
            }}
            onClick={(e) => e.stopPropagation()}>
            <p
              className="gencl:leading-5 gencl:font-semibold gencl:m-0"
              style={{
                fontSize: isSmall ? "14px" : isFullScreen ? "16px" : "14px",
                color: ctaTextColor,
              }}>
              {ctaText}
            </p>
          </a>
        </div>
      )}

      {/* Ad-copy or OG meta — OG takes priority when show_url_meta is set */}
      {splitActive ? null : item?.cta?.show_url_meta && ogDetails ? (
        <div data-testid="bottombar-og" className="gencl:flex gencl:items-center gencl:gap-2">
          {ogDetails.og_image && (
            <img
              src={ogDetails.og_image}
              className="gencl:rounded-[4px] gencl:object-cover gencl:shrink-0"
              style={{
                width: isSmall ? "36px" : "28px",
                height: isSmall ? "36px" : "28px",
              }}
              alt="preview"
            />
          )}
          <p
            className="gencl:text-white gencl:font-medium gencl:overflow-hidden gencl:break-words gencl:m-0"
            style={{
              fontSize: adFontSize,
              lineHeight: adLineHeight,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
            {ogDetails.og_title}
          </p>
        </div>
      ) : adCopyText ? (
        <div data-testid="bottombar-ad-copy">
          <p
            className="gencl:text-white gencl:font-medium gencl:overflow-hidden gencl:break-words gencl:m-0"
            style={{
              fontSize: adFontSize,
              lineHeight: adLineHeight,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
            {adCopyText}
          </p>
        </div>
      ) : null}
    </div>
  );
}
