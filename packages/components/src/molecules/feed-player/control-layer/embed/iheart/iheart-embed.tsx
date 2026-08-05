"use client";
import { Image } from "@genuin/ui/components/image";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import { resolveControlSize } from "@genuin/ui/player-controls";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { useBaseContext, useEmbedContext } from "@genuin/components/context";
import type { GenericData } from "@genuin/components/context/base/feed-context-manager";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { addIheartCtaCampaign } from "@genuin/components/lib/utils/iheart-url";
import { ReadMore } from "@genuin/components/molecules/read-more";
import type { ReadMoreTextType } from "@genuin/components/molecules/read-more/read-more.types";
import { useEmbedManagerContext } from "@genuin/components/organisms/embed/context";

import { usePlayerContext } from "../../../context";
import type { ControlLayerPropsType } from "../../control-layer.types";
import { isSponsoredVideo, SponsoredTag } from "../../controls/sponsored-tag";
import { OctoExpandSheet } from "../../octo/octo-expand-sheet";
import { PlacementMetadata } from "../../placement/placement-metadata";

import { IHeartControls } from "./controls";
import { IHeartListenLiveButton } from "./listen-live-button";

export function IHeartControlLayer({
  postDetails,
  className,
  layoutType,
  isActive,
  index,
  onReactionStateChange,
  onClick,
  onCommentCountChange,
  onMouseEnter,
  onMouseLeave,
  containerWidth,
  ...restProps
}: ControlLayerPropsType) {
  const { baseContextManager } = useBaseContext();
  const {
    view: { websiteType, isPlacementView },
    brand: { expandOnInteraction },
    engagement,
    expandViewConfig,
  } = useEmbedConfigs();
  const { isMobile } = useDeviceDetectMediaQuery();
  const { play, pause } = usePlayerContext();
  const { swiper } = useEmbedManagerContext();
  const { changeActivePlayerType } = useEmbedContext();
  const embedConfigs = useEmbedConfigs();

  const isOctoEnabled = engagement.engagementTools.octo;
  const { getContentTypeState, octoVisible } = useSheetState();
  const octoSheetState = getContentTypeState("octo");
  const isActiveOctoSheet = isOctoEnabled && (octoSheetState === "panel-view" || octoSheetState === "full-view");
  const isOctoVisible = octoVisible;

  // Placement view reuses the shared section metadata (section details + clips
  // count) alongside iheart's own header/footer. Embed view is untouched.
  const { sectionDetails, noOfClips } = PlacementMetadata({ postDetails });
  const showPlacementMeta = isPlacementView && !isOctoVisible;
  // Single metadata block reused across the placement slots — its position in
  // the banner is driven by SECTION_METADATA_PLACEMENT.
  const hasClipCount = noOfClips !== null && noOfClips !== undefined && noOfClips !== false;
  const sectionMetadata = showPlacementMeta ? (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      <div>{sectionDetails}</div>
      {hasClipCount && <div>{" • "}</div>}
      <div>{noOfClips}</div>
    </div>
  ) : null;

  // Always joins the header row when sponsored (V2 only) — with artwork/title/
  // description present it lands top-right (last of 3 children, `justify-between`);
  // with none of them it's the row's only child, so the same rule puts it
  // top-left. One flex structure covers both positions; no separate condition.
  const isSponsored = embedConfigs.isDesignSystemV2 && isSponsoredVideo(postDetails.video);
  // Size off the TILE width, matching the corner pill in embed-tile.tsx. Using
  // `responsive.controlSize` here read the whole placement container instead, so a
  // 1280 px carousel of 337 px tiles rendered an `lg` pill next to `sm` ones.
  const sponsoredTagSize = containerWidth ? resolveControlSize(containerWidth) : "lg";

  const swipeStartYRef = useRef<number>(0);

  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    postDetails.video?.isWatched || (baseContextManager.getVideoState(postDetails.video?.id ?? "")?.isWatched ?? false)
  );

  // Navigation announcement state
  const [navigationAnnouncement, setNavigationAnnouncement] = useState<string>("");
  const previousIndexRef = useRef<number | undefined>(index);

  // Enhanced description logic matching expand-view-details
  const enhancedDescription: ReadMoreTextType = useMemo(() => {
    if (!postDetails.video) return [];
    const { description, createdAt, duration } = postDetails.video;

    const monthYear = getMonthYear(createdAt ?? 0);
    const durationText = duration ? ` • ${getFormattedDuration(String(duration))}` : "";

    return [
      {
        type: "custom",
        text: `${monthYear}${durationText}`,
        style: { color: "#ffffff" },
        className:
          "gencl:text-[14px] gencl:font-normal gencl:leading-[18px] gencl:tracking-[-0.2px]! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!",
      },
      " ",
      ...(description ? (Array.isArray(description) ? description : [description]) : []),
    ];
  }, [postDetails.video?.createdAt, postDetails.video?.duration, postDetails.video?.description]);

  useEffect(() => {
    function handleVideoWatched(payload: Partial<GenericData>) {
      if (payload && "videoId" in payload && "isVideoWatched" in payload && postDetails.video?.id === payload.videoId)
        setIsVideoWatched(payload.isVideoWatched ?? false);
    }

    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, []);

  // Handle navigation announcements when index changes
  useEffect(() => {
    if (typeof index === "number" && typeof previousIndexRef.current === "number") {
      const videoTitle = postDetails.video?.attributes?.title || "video";
      let announcement = "";

      if (index > previousIndexRef.current) {
        announcement = `Next Highlight. Playing ${videoTitle}`;
      } else if (index < previousIndexRef.current) {
        announcement = `Previous Highlight. Playing ${videoTitle}`;
      }

      if (announcement) {
        setNavigationAnnouncement(announcement);
        // Clear the announcement after a short delay to reset for next navigation
        setTimeout(() => setNavigationAnnouncement(""), 100);
      }
    }

    previousIndexRef.current = index;
  }, [index, postDetails.video?.attributes?.title]);

  /**
   * Triggers preview playback when user hovers over the video.
   * Sets the preview index to this video, which activates the 3-second looping preview
   * in the feed player provider's onPreviewIndexChanged handler.
   *
   * Debounced by 300ms to prevent rapid preview triggering.
   * only if IHeart.
   */
  // const debouncedSetPreviewIndex = useDebounceCallback(() => {}, 300);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(e);
      if (embedConfigs.video.videoShouldPreview && index !== undefined && !isVideoWatched) {
        // Set preview index to activate hover preview for this video
        baseContextManager.setPreviewIndex({
          index,
          videoId: postDetails.video?.id ?? "",
        });
      }
    },
    [onMouseEnter, isVideoWatched]
  );

  /**
   * Stops preview playback when user moves mouse away from the video.
   * Clears the preview index (sets to null), which pauses the preview
   * in the feed player provider's onPreviewIndexChanged handler.
   *
   * Cancels any pending debounced preview to prevent it from triggering after mouse leave.
   * only if IHeart
   */
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);

      if (embedConfigs.video.videoShouldPreview) {
        // Clear preview index to stop preview playback
        baseContextManager.setPreviewIndex({
          index: null,
          videoId: postDetails.video?.id ?? "",
        });
      }
    },
    [onMouseLeave, postDetails, baseContextManager, embedConfigs]
  );

  // Navigates to the channel/podcast page on iheart.com when the user clicks
  // the header logo or channel name. Always uses an absolute iheart.com URL so
  // subdomain pages (e.g. z100.iheart.com) never resolve it against their origin.
  const handleHeaderClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const attrs = postDetails.video?.attributes;
      const episodeId = attrs?.episode_id ? Number(attrs.episode_id) : undefined;
      const podcastId = attrs?.podcast_id ? Number(attrs.podcast_id) : undefined;
      const stationId = attrs?.station_id ? Number(attrs.station_id) : undefined;
      const slug = attrs?.slug;

      const isStation = !podcastId && !episodeId;
      const isFullEpisode = podcastId && episodeId;
      const url = new URL(
        "https://iheart.com/" +
          (isStation ? "live/" : "podcast/") +
          (isStation ? stationId : slug) +
          (isFullEpisode ? "/episode/" + episodeId : "")
      );
      const destinationUrl = addIheartCtaCampaign(url);
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    },
    [postDetails.video]
  );

  const listenLiveButtonInfo = useMemo(
    () => ({
      episode: postDetails.video?.attributes?.episode_id ? Number(postDetails.video.attributes?.episode_id) : undefined,
      podcast: postDetails.video?.attributes?.podcast_id ? Number(postDetails.video.attributes?.podcast_id) : undefined,
      station: postDetails.video?.attributes?.station_id ? Number(postDetails.video.attributes?.station_id) : undefined,
      type: postDetails.video?.attributes?.type,
    }),
    [
      postDetails.video?.attributes?.episode_id,
      postDetails.video?.attributes?.podcast_id,
      postDetails.video?.attributes?.station_id,
      postDetails.video?.attributes?.type,
    ]
  );

  useEffect(() => {
    const swiperInstance = swiper;
    if (!swiperInstance) {
      return;
    }

    // When expandOnInteraction is active the overlay captures all taps and
    // opens expand-view instead — swiping should be disabled entirely so the
    // tile doesn't slide away before the expand handler fires.
    if (expandOnInteraction) {
      swiperInstance.disable();
      return;
    }

    if (!isOctoEnabled) {
      swiperInstance.enable();
      if (isActive) {
        play(false);
      }
      return;
    }

    if (isActiveOctoSheet) {
      swiperInstance.disable();
      if (isActive) {
        pause(false);
      }
    } else {
      swiperInstance.enable();
      if (isActive) {
        play(false);
      }
    }
  }, [swiper, isActive, isOctoEnabled, isActiveOctoSheet, expandOnInteraction, play, pause]);

  const video = postDetails.video;
  if (!video) return null;

  return (
    <div
      // role="region"
      // aria-label={`Video player controls for ${video.attributes?.title || "video"}`}
      className={cn("gencl:h-full gencl:relative", className)}
      onClick={(e) => {
        if (isVideoWatched) {
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
      onPointerDown={(e) => {
        window.dispatchEvent(new CustomEvent("sdk:userInteracted"));
        if (expandOnInteraction && expandViewConfig.enable) {
          swipeStartYRef.current = e.clientY;
        }
      }}
      onPointerUp={(e) => {
        if (!expandOnInteraction || !expandViewConfig.enable) return;
        const dy = Math.abs(e.clientY - swipeStartYRef.current);
        if (dy > 20) changeActivePlayerType("expand-view", index);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...restProps}>
      {/* Screen reader announcement for navigation */}
      <div aria-live="polite" aria-atomic="true" className="gencl:sr-only">
        {navigationAnnouncement}
      </div>
      {/* Top gradient overlay (10% height) */}
      <div
        role="region"
        aria-label={`${video.attributes?.title} click to play`}
        tabIndex={0}
        className={cn(
          "gencl:h-full gencl:relative gencl:cursor-pointer",
          isVideoWatched && "gencl:cursor-default",
          className
        )}
        onClick={(e) => {
          if (isVideoWatched) {
            e.stopPropagation();
            return;
          }
          onClick?.(e);
        }}
        onKeyDown={(e) => {
          // Only handle keyboard events if the event target is the main div (not a child element)
          if (e.target !== e.currentTarget) {
            return;
          }

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isVideoWatched) {
              e.stopPropagation();
              return;
            }
            // Create a synthetic mouse event for keyboard activation
            const syntheticEvent = {
              ...e,
              stopPropagation: e.stopPropagation.bind(e),
              preventDefault: e.preventDefault.bind(e),
            } as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>;
            onClick?.(syntheticEvent);
          }
        }}
        {...restProps}>
        {/* Top gradient overlay (10% height) */}
        <div
          aria-hidden="true"
          className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none"
          style={{
            height: "25%",
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Bottom gradient overlay (40% height) */}
        <div
          aria-hidden="true"
          className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none"
          style={{
            height: "35%",
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Expand-on-interaction overlay — transparent tap target that opens
            expand-view when the feature flag is active. Rendered at z-10 so it
            sits above the video but below the IHeartControls / IHeartListenLiveButton
            row which explicitly uses z-20. */}
        {expandOnInteraction && isActive && expandViewConfig.enable && (
          <div
            aria-hidden="true"
            className="gencl:absolute gencl:inset-0 gencl:z-10"
            onClick={(e) => {
              e.stopPropagation();
              changeActivePlayerType("expand-view", index);
            }}
          />
        )}

        {/* Header Section */}
        {!isActiveOctoSheet && (
          <header className="gencl:absolute gencl:top-0 gencl:w-full gencl:flex gencl:flex-col gencl:justify-between gencl:text-white gencl:p-3">
            {/* items-start puts artwork, title and pill on one top line — without it
                the default `stretch` lets a taller neighbour shift the pill down. */}
            <div className="gencl:flex gencl:items-start gencl:justify-between gencl:gap-2">
              {postDetails.video?.attributes?.image_url && (
                <Image
                  aspectRatio="square"
                  src={postDetails.video.attributes?.image_url ?? ""}
                  alt={`${postDetails.video.attributes?.title || ""}, live radio artwork`}
                  tabIndex={isVideoWatched ? -1 : 0}
                  role="button"
                  onClick={!isVideoWatched ? handleHeaderClick : undefined}
                  className={cn(
                    "gencl:rounded-md gencl:object-cover gencl:cursor-pointer",
                    websiteType === "polaris" ? "gencl:size-12 gencl:lg:size-16!" : "gencl:size-14!"
                  )}
                />
              )}
              {(postDetails.video?.attributes?.title || postDetails.video?.attributes?.description) && (
                // min-w-0 lets the clamped title/description shrink so the pill keeps
                // its full width instead of the label wrapping mid-word.
                <div className="gencl:w-full gencl:min-w-0">
                  {postDetails.video?.attributes?.title && (
                    <p
                      tabIndex={isVideoWatched ? -1 : 0}
                      role="button"
                      onClick={!isVideoWatched ? handleHeaderClick : undefined}
                      aria-label={`${postDetails.video.attributes?.title}, title`}
                      className={cn(
                        "gencl:font-semibold gencl:leading-[18px] gencl:line-clamp-1 gencl:tracking-[-0.2px] gencl:lg:font-semibold! gencl:lg:leading-[24px]! gencl:lg:tracking-[-0.2px]! gencl:cursor-pointer",
                        websiteType === "polaris" ? "gencl:text-[14px] gencl:lg:text-[17px]!" : "gencl:text-[16px]"
                      )}>
                      {postDetails.video.attributes?.title}
                    </p>
                  )}
                  {postDetails.video?.attributes?.description && (
                    <p
                      tabIndex={isVideoWatched ? -1 : 0}
                      aria-label={`${postDetails.video.attributes?.description}, Video title`}
                      className="gencl:text-[12px] gencl:font-normal gencl:leading-[16px] gencl:line-clamp-2 gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!">
                      {postDetails.video.attributes?.description}
                    </p>
                  )}
                </div>
              )}
              {/* `ml-auto` pins the pill to the row's end regardless of whether artwork/
                  title/description are present — with them it lands top-right same as
                  before; alone, it no longer falls back to top-left via `justify-between`. */}
              {isSponsored && <SponsoredTag size={sponsoredTagSize} className="gencl:self-start gencl:ml-auto" />}
            </div>
          </header>
        )}

        {/* Footer Section */}
        <footer
          className={cn(
            "gencl:absolute gencl:bottom-0 gencl:p-3 gencl:text-white gencl:w-full",
            isActiveOctoSheet && "gencl:space-y-3 gencl:h-full gencl:p-0"
          )}>
          {/* FOOTER — section metadata above the description. */}
          {sectionMetadata && <div className="gencl:mb-2">{sectionMetadata}</div>}
          {!isOctoVisible && (
            <div className="gencl:rounded">
              <ReadMore
                text={enhancedDescription}
                showExpandText={false}
                shouldAnimate
                expandable={false}
                position="overlay"
                showOverlay={true}
                textClassName="gencl:z-10 gencl:text-[14px] gencl:font-normal gencl:leading-[18px] gencl:tracking-[-0.2px]! gencl:text-white! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!"
                maxLines={2}
                tabIndex={isVideoWatched ? -1 : 0}
                aria-label={`${getMonthYear(postDetails.video?.createdAt ?? 0)}${postDetails.video?.duration ? ` • ${getFormattedDuration(String(postDetails.video.duration))}` : ""} ${Array.isArray(postDetails.video?.description) ? postDetails.video.description.join(" ") : postDetails.video?.description || ""}, Video description`}
              />
            </div>
          )}

          {/* Controls Section — z-20 ensures these sit above the z-10 expand overlay */}
          <div
            className={cn(
              "gencl:relative gencl:z-20 gencl:overflow-hidden gencl:transition-all gencl:ease-in-out gencl:duration-300 gencl:flex gencl:pt-2",
              isOctoEnabled ? "gencl:justify-end gencl:items-end" : "gencl:justify-between gencl:items-center"
            )}>
            {/* Octo Sheet */}
            <OctoExpandSheet
              isActive={isActive ?? false}
              videoId={video.id}
              videoSlug={video.slug}
              isMobile={isMobile}
            />

            {!isOctoVisible && (
              <IHeartControls
                onClick={(e) => e.stopPropagation()}
                className={cn("gencl:z-20 gencl:lg:gap-1!")}
                size="lg"
                variant={isOctoEnabled ? "expand" : "clip"}
                videoDetails={postDetails.video}
                section={postDetails.section}
                index={index}
                isActive={isActive}
                contentId={postDetails.video?.id}
                slug={postDetails.video?.slug}
                isReacted={postDetails.video?.isSparked ?? false}
                reactionCount={postDetails.video?.sparkCount}
                onReactionStateChange={(isReacted) => {
                  onReactionStateChange?.(postDetails.video?.id ?? "", postDetails.video?.slug ?? "", isReacted);
                }}
                isVideoWatched={isVideoWatched}
              />
            )}
            {!isOctoVisible && (
              <IHeartListenLiveButton variant="filled" info={listenLiveButtonInfo} videoDetails={postDetails.video} />
            )}
          </div>
        </footer>

        {/* {isVideoWatched && (
          <IHeartEndOfContentOverlay
            isMobile={isMobile}
            info={listenLiveButtonInfo}
            videoDetails={postDetails.video}
            onPlayAgain={() => {
              // Handle play again action
              baseContextManager.setVideoWatched({
                videoId: video.id,
                isWatched: false,
              });
              togglePlay(true);
            }}
          />
        )} */}
      </div>
    </div>
  );
}
