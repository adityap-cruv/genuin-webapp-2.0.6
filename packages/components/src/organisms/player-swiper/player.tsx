"use client";
import { cn, detectAccessibilityMode } from "@genuin/ui/utils";
import { useCallback, useMemo, lazy, Suspense, useState, useEffect } from "react";
import type { ComponentProps } from "react";
import { useSwiper } from "swiper/react";

import { VideoTypes } from "@genuin/components/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type { AdInfoType } from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context/provider";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { FEED_SKELETON_THEME, PlayerSkeleton } from "@genuin/components/templates/feed/feed-skeleton";

import { usePlayerContext } from "../../molecules/feed-player/context/context";

import { IHeartEmbedBar, IFRAME_HEIGHT } from "./iheart/iheart-embed-bar";

const ControlLayer = lazy(() =>
  import("@genuin/components/molecules/feed-player/control-layer").then((m) => ({
    default: m.ControlLayer,
  }))
);

// Lazy load video player to defer heavy playback logic
const FeedPlayer = lazy(() =>
  import("@genuin/components/molecules/feed-player").then((m) => ({
    default: m.FeedPlayer,
  }))
);

/**
 * Inner component that lives inside PlayerProvider so it can access player context.
 * Pauses the video when the octo sheet is in full-view or panel-view, and resumes when not.
 */
function SheetStatePlaybackController({ isActive }: { isActive: boolean }) {
  const { pause, play } = usePlayerContext();
  const { getContentTypeState, sheetState } = useSheetState();

  useEffect(() => {
    if (!isActive) return;

    const octoState = getContentTypeState("octo");
    const shouldPause = octoState === "full-view" || octoState === "panel-view";

    if (shouldPause) {
      pause(false);
    } else {
      play(false);
    }
  }, [sheetState, isActive, pause, play, getContentTypeState]);

  return null;
}

type PlayerProps = {
  post: PostDetailsType;
  index: number;
  isSectioned?: boolean;
  isActive: boolean;
  isNext: boolean;
  isPrev: boolean;
  isVisible: boolean;
  /**
   * True when this slide is the swiper's `initialSlide` (the clicked tile). Swiper's
   * `isActive`/`isVisible` render-prop flags are all false on the very first commit
   * — they only flip true after Swiper's JS init runs a tick later. Without this
   * hint the initial slide's player gate fails on first paint and renders nothing,
   * so the parent (whose Suspense already resolved) shows a black box until Swiper
   * initialises. This forces the clicked slide to render immediately.
   */
  isInitialSlide?: boolean;
  totalVideos?: number;
  onReactionStateChange?: (videoId: string, videoSlug: string, isReacted: boolean) => void;
  onCommunityJoinStatusChange: ComponentProps<typeof ControlLayer>["onCommunityJoinStatusChange"];
  onGroupJoinStatusChange: ComponentProps<typeof ControlLayer>["onGroupJoinStatusChange"];
  onGroupSubscriptionChange: ComponentProps<typeof ControlLayer>["onGroupSubscriptionChange"];
  onCommentCountChange: ComponentProps<typeof ControlLayer>["onCommentCountChange"];
  onAdStarted?: (e?: AdInfoType, index?: number) => void;
  onAdEnded?: (e?: AdInfoType, index?: number) => void;
  onAdFilled?: (type: string, index: number) => void;
  onAdPlaybackEnd?: (index: number) => void;
  /** Feed-session identifier from the first feed API page, forwarded to analytics. */
  pageSession?: string | null;
};

// TODO: This component is using feed context, which is not ideal. Remove this dep of FeedContext in future.
export function Player({
  post,
  index,
  isSectioned,
  isActive,
  isNext,
  isPrev,
  isVisible,
  isInitialSlide,
  totalVideos,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  onCommentCountChange,
  onAdStarted,
  onAdEnded,
  onAdPlaybackEnd,
  onAdFilled,
}: PlayerProps) {
  const { showExpandView, toggleExpandView, activeIndex, variant } = useFeedContext();
  const { muted, theme } = useBaseContext();
  const [isAdFilled, setIsAdFilled] = useState(false);
  // Ad types whose creatives should suppress the control layer (banner/display/native).
  const [hideControlsForAd, setHideControlsForAd] = useState(false);
  // const { isActive, isNext, isPrev, isVisible } = useSwiperSlide();
  const swiper = useSwiper();
  const { showGestureOverlay } = useGestureOverlayManager();
  const {
    view: { brandLayoutType },
    video: { videoCrop },
    brand: { showIheartIframe },
  } = useEmbedConfigs();
  const { isMobile } = useDeviceDetectMediaQuery();

  const showIheartBar = showIheartIframe && isActive;
  const { sheetState } = useSheetState();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const isNonDesktop = !isDesktop; // Mobile + Tablet (< 1024px)

  // Detect accessibility mode based on browser accessibility preferences
  const isAccessibilityMode = useMemo(() => detectAccessibilityMode(), []);

  const handleTimeUpdate = useCallback(
    (event: Event) => {
      const video = event.target as HTMLVideoElement | null;
      if (video && video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100;

        if (activeIndex === 1 && progress >= 50) {
          showGestureOverlay("PLAY_PAUSE", muted);
        }
      }
    },
    [activeIndex, muted, showGestureOverlay]
  );

  const handleAdFilled = useCallback(
    (type: string) => {
      onAdFilled?.(type, index);
      setIsAdFilled(true);
      // Banner/display/native creatives render their own UI; hide our control layer.
      const adType = type?.toLowerCase();
      setHideControlsForAd(adType === "banner" || adType === "display" || adType === "native");
    },
    [onAdFilled, index]
  );

  const handleAdPlaybackEnd = useCallback(() => {
    setIsAdFilled(false);
    setHideControlsForAd(false);
    onAdPlaybackEnd?.(index);
  }, [onAdPlaybackEnd, index]);

  const handlePlayerIterationEnd = useCallback(() => {
    // Defer past React's render cycle so the disable effect from isAdFilled
    // doesn't re-disable swiper after we enable it but before slideNext fires.
    setTimeout(() => {
      swiper.allowSlideNext = true;
      swiper.allowSlidePrev = true;
      swiper.enable();
      swiper.slideNext();
    }, 0);
  }, [swiper]);

  const handleOnEnded = useCallback(() => {
    if (totalVideos === undefined || totalVideos > 1) {
      showGestureOverlay("SWIPE");
    }
  }, [totalVideos, showGestureOverlay]);

  // load player when the post is active or previous/next post is active or the post is visible
  // For accessibility mode, always load to help with keyboard navigation and screen readers
  // isInitialSlide covers the clicked tile on first commit, before Swiper init flips
  // its isActive/isVisible flags true — without it that slide renders nothing and
  // the resolved parent shows a black box.
  if (isAccessibilityMode || isActive || isNext || isPrev || isVisible || isInitialSlide)
    return (
      <PlayerProvider
        isActive={isActive}
        videoId={post.video?.id ?? ""}
        videoUrl={post.video?.source ?? ""}
        showExpandView={showExpandView}
        toggleExpandView={toggleExpandView}
        swiper={swiper}
        index={index}
        onPlayerIterationEnd={handlePlayerIterationEnd}
        totalVideos={totalVideos}
        activeIndex={activeIndex}
        onAdStarted={onAdStarted}
        onAdEnded={onAdEnded}
        videoType={post.video?.videoType ?? VideoTypes.Content}>
        <SheetStatePlaybackController isActive={isActive} />
        <div
          className={cn(
            "gencl:group gencl:relative gencl:h-full gencl:w-full gencl:overflow-clip gencl:transition-all gencl:duration-300 gencl:ease-in-out",
            {
              "gencl:sm:rounded-xl!": !showExpandView,
            },
            {
              "gencl:sm:rounded!": brandLayoutType === "iheart",
            },
            (showIheartBar || (isActive && (sheetState === "panel-view" || sheetState === "full-view"))) &&
              "gencl:flex gencl:flex-col"
          )}
          // tabIndex={showExpandView ? 0 : -1}
          // role="region"
          // aria-label={`Video ${index + 1} - ${post.video?.attributes?.title || post.video?.descritptionText || "Video content"}`}
        >
          <div
            className="gencl:relative gencl:transition-all gencl:duration-300 gencl:ease-in-out"
            style={{
              height: showIheartBar
                ? `calc(100% - ${IFRAME_HEIGHT}px)`
                : isActive && sheetState === "panel-view"
                  ? "30%"
                  : isActive && sheetState === "full-view"
                    ? "0"
                    : "100%",
              flexShrink: isActive && (sheetState === "panel-view" || sheetState === "full-view") ? 0 : undefined,
            }}>
            <SafeSuspense
              fallback={
                // Player shimmer, NOT null. The feed-player chunk is heavy; on
                // resource-constrained host pages it can take a while to download.
                // A null fallback shows a bare black box (the "black screen" between
                // skeleton and player). The shimmer holds the space until FeedPlayer
                // mounts and its VideoPlayer paints the poster/thumbnail.
                <PlayerSkeleton
                  colors={FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"]}
                  isMobile={isMobile}
                />
              }
              errorFallback={null}>
              <FeedPlayer
                videoId={post.video?.id ?? ""}
                videoDescription={post.video?.descritptionText}
                src={post.video?.source}
                adUrl={post.video?.adUrl ?? undefined}
                id={"feed-player--" + post.video?.id}
                poster={post.video?.thumbnail ?? ""}
                videoType={post.video?.videoType ?? VideoTypes.Content}
                className={cn(
                  "gencl:h-full! gencl:w-full",
                  sheetState === "panel-view" || sheetState === "full-view"
                    ? "gencl:object-contain! gencl:bg-contain!"
                    : videoCrop
                      ? "gencl:object-cover gencl:bg-cover!"
                      : "gencl:object-contain gencl:bg-contain!"
                )}
                playsInline
                isActive={isActive}
                adTagObject={(post as any).adTagObject ?? undefined}
                onAdFilled={handleAdFilled}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleOnEnded}
                style={{ height: "inherit" }}
                onAdPlaybackEnd={handleAdPlaybackEnd}
                isSponsored={post.video?.cardLayoutId === 7 || post.video?.videoLayoutId === 6}
                adsPlatform={post.video?.adsPlatform}
                playerSize={{
                  height: swiper.height,
                  width: swiper.width,
                }}
                sponsorshipInfo={post.sponsored}
              />
            </SafeSuspense>
          </div>
          {/* null fallback is correct: ControlLayer is a transparent `absolute inset-0`
              overlay of action buttons/gradients over the FeedPlayer rendered above —
              the video/poster is already painted behind it, so there is no black screen
              while its chunk loads (a shimmer over live video would look worse). */}
          {!(isAdFilled && hideControlsForAd) && (
            <SafeSuspense fallback={null} errorFallback={null}>
              <ControlLayer
                index={index}
                isActive={isActive}
                postDetails={post}
                isSectioned={isSectioned}
                onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                onGroupJoinStatusChange={onGroupJoinStatusChange}
                onGroupSubscriptionChange={onGroupSubscriptionChange}
                showCloseButton={variant === "expand"}
                onReactionStateChange={onReactionStateChange}
                onCommentCountChange={onCommentCountChange}
                // Applies GPU acceleration to prevent layer flickering on iOS devices during animations
                className="gencl:translate-x-0"
                containerWidth={swiper.width}
                adType={post.video?.adUrl ? "in-stream" : "in-feed"}
              />
            </SafeSuspense>
          )}
          {showIheartBar && <IHeartEmbedBar attributes={post.video?.attributes} />}
        </div>
      </PlayerProvider>
    );
}
