"use client";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  lazy,
  Suspense,
  type FC,
} from "react";
import { Image } from "@genuin/ui/components/image";
import { IHeartControls } from "./controls";
import { IHeartListenLiveButton } from "./listen-live-button";
import { ControlLayerPropsType } from "../../control-layer.types";
import { useBaseContext } from "@genuin/components/context";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { GenericData } from "@genuin/components/context/base/feed-context-manager";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { usePlayerContext } from "../../../context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { ReadMoreTextType } from "@genuin/components/molecules/read-more/read-more.types";
import { IHeartEndOfContentOverlay } from "./end-of-content-overlay";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { useOctoSheetManagement } from "../../expand-view/use-octo-sheet-management";
import useViewportHeight from "@genuin/components/hooks/use-screen-height";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { useEmbedManagerContext } from "@genuin/components/organisms/embed/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

const OctoDynamicSheet = lazy(() =>
  import("../../expand-view/octo-dynamic-sheet.js").then((m) => ({
    default: m.OctoDynamicSheet,
  })),
);

export const IHeartControlLayer: FC<ControlLayerPropsType> = ({
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
  ...restProps
}) => {
  const { baseContextManager } = useBaseContext();
  const {
    view: { websiteType },
    engagement,
  } = useEmbedConfigs();
  const { isMobile } = useDeviceDetectMediaQuery();
  const { togglePlay, play, pause } = usePlayerContext();
  const { swiper } = useEmbedManagerContext();
  const embedDetails = useSafeEmbedContext();
  const embedConfigs = useEmbedConfigs();

  // Octo sheet integration
  // const isOctoEnabled = engagement.engagementTools.octo;
  const isOctoEnabled = Boolean(embedConfigs.view.isFeed);

  const viewportHeight = useViewportHeight();
  const { getContentTypeState, setContentTypeState, resetSheet } =
    useSheetState();
  const octoSheetState: DynamicSheetState = getContentTypeState("octo");
  const isActiveOctoSheet =
    isOctoEnabled &&
    (octoSheetState === "panel-view" || octoSheetState === "full-view");
  const isCompactOctoState =
    octoSheetState === "default" ||
    octoSheetState === "default-active" ||
    octoSheetState === "expand-view";
  const octoRenderMode: "compact" | "full" = isCompactOctoState
    ? "compact"
    : "full";

  const {
    handleOctoExpandRequest,
    handleOctoSheetStateChange,
    handleOctoSheetClose,
    handleOctoThinkingStarted,
    handleOctoCountdownActive,
    handleOctoError,
  } = useOctoSheetManagement({
    enabled: isOctoEnabled,
    isActive: isActive ?? false,
    octoSheetState,
    setContentTypeState,
    resetSheet,
    variant: "embed",
  });

  // Delay Octo visibility by 5 seconds after the video becomes active.
  // Resets immediately on slide change so the next active slide waits its own 5 s.
  const [shouldShowOcto, setShouldShowOcto] = useState(false);

  useEffect(() => {
    setShouldShowOcto(false);

    if (!isOctoEnabled || !isActive) return;
    const timer = setTimeout(() => setShouldShowOcto(true), 5000);
    return () => {
      clearTimeout(timer);
      resetSheet();
    };
  }, [isActive, isOctoEnabled, resetSheet]);

  // Hide OctoDynamicSheet visually after close; reveal again when any action starts.
  const [isOctoHidden, setIsOctoHidden] = useState(false);

  const handleOctoSheetCloseWithHide = useCallback(() => {
    setIsOctoHidden(true);
    handleOctoSheetClose();
  }, [handleOctoSheetClose]);

  const handleOctoThinkingStartedWithShow = useCallback(() => {
    setIsOctoHidden(false);
    handleOctoThinkingStarted();
  }, [handleOctoThinkingStarted]);

  const handleOctoCountdownActiveWithShow = useCallback(
    (active: boolean) => {
      if (active) setIsOctoHidden(false);
      handleOctoCountdownActive(active);
    },
    [handleOctoCountdownActive],
  );

  const handleOctoExpandRequestWithShow = useCallback(() => {
    setIsOctoHidden(false);
    handleOctoExpandRequest();
  }, [handleOctoExpandRequest]);

  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(false);

  // Navigation announcement state
  const [navigationAnnouncement, setNavigationAnnouncement] =
    useState<string>("");
  const previousIndexRef = useRef<number | undefined>(index);

  // Enhanced description logic matching expand-view-details
  const enhancedDescription: ReadMoreTextType = useMemo(() => {
    if (!postDetails.video) return "";
    const { description, createdAt, duration } = postDetails.video;

    const monthYear = getMonthYear(createdAt ?? 0);
    const durationText = duration
      ? ` • ${getFormattedDuration(String(duration))}`
      : "";

    return [
      {
        type: "custom",
        text: `${monthYear}${durationText}`,
        style: { color: "#ffffff" },
        className:
          "gencl:text-[14px] gencl:font-normal gencl:leading-[18px] gencl:tracking-[-0.2px]! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!",
      },
      " ",
      ...(description
        ? Array.isArray(description)
          ? description
          : [description]
        : []),
    ];
  }, [
    postDetails.video?.createdAt,
    postDetails.video?.duration,
    postDetails.video?.description,
  ]);

  useEffect(() => {
    function handleVideoWatched(payload: Partial<GenericData>) {
      if (
        payload &&
        "videoId" in payload &&
        "isVideoWatched" in payload &&
        postDetails.video?.id === payload.videoId
      )
        setIsVideoWatched(payload.isVideoWatched ?? false);
    }

    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, []);

  // Handle navigation announcements when index changes
  useEffect(() => {
    if (
      typeof index === "number" &&
      typeof previousIndexRef.current === "number"
    ) {
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
    (e: any) => {
      onMouseEnter?.(e);
      if (
        embedConfigs.video.videoShouldPreview &&
        index !== undefined &&
        !isVideoWatched
      ) {
        // Set preview index to activate hover preview for this video
        baseContextManager.setPreviewIndex({
          index,
          videoId: postDetails.video?.id || "",
        });
      }
    },
    [onMouseEnter, isVideoWatched],
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
    (e: any) => {
      onMouseLeave?.(e);

      if (embedConfigs.video.videoShouldPreview) {
        // Clear preview index to stop preview playback
        baseContextManager.setPreviewIndex({
          index: null,
          videoId: postDetails.video?.id || "",
        });
      }
    },
    [onMouseLeave, postDetails, baseContextManager, embedConfigs],
  );

  const listenLiveButtonInfo = useMemo(
    () => ({
      episode: postDetails.video?.attributes?.episode_id
        ? Number(postDetails.video.attributes.episode_id)
        : undefined,
      podcast: postDetails.video?.attributes?.podcast_id
        ? Number(postDetails.video?.attributes.podcast_id)
        : undefined,
      station: postDetails.video?.attributes?.station_id
        ? Number(postDetails.video?.attributes.station_id)
        : undefined,
      type: postDetails.video?.attributes?.type,
    }),
    [
      postDetails.video?.attributes?.episode_id,
      postDetails.video?.attributes?.podcast_id,
      postDetails.video?.attributes?.station_id,
      postDetails.video?.attributes?.type,
    ],
  );

  useEffect(() => {
    const swiperInstance = swiper;
    if (!swiperInstance) {
      return;
    }

    if (!isOctoEnabled) {
      swiperInstance.enable();
      if (isActive) {
        play(false);
      }
      return;
    }

    const shouldDisableSwiper =
      octoSheetState === "panel-view" || octoSheetState === "full-view";

    if (shouldDisableSwiper) {
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
  }, [swiper, isActive, octoSheetState, isOctoEnabled, play, pause]);

  return (
    <div
      // role="region"
      // aria-label={`Video player controls for ${postDetails.video.attributes?.title || "video"}`}
      className={cn("gencl:h-full gencl:relative", className)}
      onClick={(e) => {
        if (isVideoWatched) {
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
      onPointerDown={() => {
        window.dispatchEvent(new CustomEvent("sdk:userInteracted"));
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...restProps}
    >
      {/* Screen reader announcement for navigation */}
      <div aria-live="polite" aria-atomic="true" className="gencl:sr-only">
        {navigationAnnouncement}
      </div>
      {/* Top gradient overlay (10% height) */}
      <div
        role="region"
        aria-label={`${postDetails.video?.attributes?.title} click to play`}
        tabIndex={0}
        className={cn(
          "gencl:h-full gencl:relative gencl:cursor-pointer",
          isVideoWatched && "gencl:cursor-default",
          className,
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
        {...restProps}
      >
        {/* Top gradient overlay (10% height) */}
        <div
          aria-hidden="true"
          className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none"
          style={{
            height: "25%",
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Bottom gradient overlay (40% height) */}
        <div
          aria-hidden="true"
          className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none"
          style={{
            height: "35%",
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          }}
        />

        {/* Header Section */}
        {!isActiveOctoSheet && (
          <header className="gencl:absolute gencl:top-0 gencl:w-full gencl:flex gencl:justify-between gencl:items-center gencl:gap-2 gencl:text-white gencl:p-3">
            {postDetails.video?.attributes?.image_url && (
              <Image
                aspectRatio="square"
                src={postDetails.video.attributes?.image_url ?? ""}
                alt={`${postDetails.video.attributes?.title || ""}, live radio artwork`}
                tabIndex={isVideoWatched ? -1 : 0}
                className={cn(
                  "gencl:rounded-md gencl:object-cover",
                  websiteType === "polaris"
                    ? "gencl:size-12 gencl:lg:size-16!"
                    : "gencl:size-14!",
                )}
              />
            )}
            <div className="gencl:w-full">
              {postDetails.video?.attributes?.title && (
                <p
                  tabIndex={isVideoWatched ? -1 : 0}
                  aria-label={`${postDetails.video.attributes?.title}, title`}
                  className={cn(
                    "gencl:font-semibold gencl:leading-[18px] gencl:line-clamp-1 gencl:tracking-[-0.2px] gencl:lg:font-semibold! gencl:lg:leading-[24px]! gencl:lg:tracking-[-0.2px]!",
                    websiteType === "polaris"
                      ? "gencl:text-[14px] gencl:lg:text-[17px]!"
                      : "gencl:text-[16px]",
                  )}
                >
                  {postDetails.video.attributes?.title}
                </p>
              )}
              {postDetails.video?.attributes?.description && (
                <p
                  tabIndex={isVideoWatched ? -1 : 0}
                  aria-label={`${postDetails.video.attributes?.description}, Video title`}
                  className="gencl:text-[12px] gencl:font-normal gencl:leading-[16px] gencl:line-clamp-2 gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!"
                >
                  {postDetails.video.attributes?.description}
                </p>
              )}
            </div>
          </header>
        )}

        {/* Footer Section */}
        <footer
          className={cn(
            "gencl:absolute gencl:bottom-0 gencl:p-3 gencl:text-white gencl:w-full",
            isActiveOctoSheet && "gencl:space-y-3 gencl:h-full gencl:p-0",
          )}
        >
          {embedDetails?.embedData.style !== "feed" && (
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

          {/* Controls Section */}
          <div
            className={cn(
              "gencl:overflow-hidden gencl:transition-all gencl:ease-in-out gencl:duration-300 gencl:items-end gencl:justify-end",
              isActiveOctoSheet && "gencl:space-y-3 gencl:h-full gencl:p-0",
              embedDetails?.embedData.style === "feed" && "gencl:flex",
            )}
          >
            {/* Octo Sheet */}
            <div
              className="gencl:relative gencl:h-full gencl:w-full swiper-no-swiping"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {isOctoEnabled && isActive && shouldShowOcto && (
                <Suspense fallback={null}>
                  <div className={cn(isOctoHidden && "gencl:invisible")}>
                    <OctoDynamicSheet
                      key={postDetails.video?.id}
                      isOpen={isActive ?? false}
                      videoId={postDetails.video?.id ?? ""}
                      videoSlug={postDetails.video?.slug ?? ""}
                      octoSheetState={octoSheetState}
                      isMobile={isMobile}
                      viewportHeight={viewportHeight}
                      octoRenderMode={octoRenderMode}
                      variant="embed"
                      onStateChange={handleOctoSheetStateChange}
                      onClose={handleOctoSheetCloseWithHide}
                      onExpandRequest={handleOctoExpandRequestWithShow}
                      onThinkingStarted={handleOctoThinkingStartedWithShow}
                      onCountdownActive={handleOctoCountdownActiveWithShow}
                      onError={handleOctoError}
                    />
                  </div>
                </Suspense>
              )}
            </div>
            {!isActiveOctoSheet && (
              <IHeartControls
                onClick={(e) => e.stopPropagation()}
                className={cn("gencl:z-20 gencl:lg:gap-1!")}
                size="lg"
                variant="clip"
                videoDetails={postDetails.video}
                index={index}
                isActive={isActive}
                contentId={postDetails.video?.id}
                slug={postDetails.video?.slug}
                isReacted={postDetails.video?.isSparked ?? false}
                reactionCount={postDetails.video?.sparkCount}
                onReactionStateChange={(isReacted) => {
                  onReactionStateChange?.(
                    postDetails.video?.id || "",
                    postDetails.video?.slug || "",
                    isReacted,
                  );
                }}
                isVideoWatched={isVideoWatched}
              />
            )}
            {/* <IHeartListenLiveButton
              variant="filled"
              info={listenLiveButtonInfo}
              videoDetails={postDetails.video}
            /> */}
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
                videoId: postDetails.video?.id || "",
                isWatched: false,
              });
              togglePlay(true);
            }}
          />
        )} */}
      </div>
    </div>
  );
};
