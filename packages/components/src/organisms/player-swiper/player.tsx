import { cn, detectAccessibilityMode } from "@genuin/ui/utils";
import { useBaseContext } from "@genuin/components/context/base";
const ControlLayer = lazy(() =>
  import("../../molecules/feed-player/control-layer/index.js").then((m) => ({
    default: m.ControlLayer,
  }))
);

// Lazy load video player to defer heavy playback logic
const FeedPlayer = lazy(() =>
  import("../../molecules/feed-player/index.js").then((m) => ({
    default: m.FeedPlayer,
  }))
);

import { PlayerProvider } from "../../molecules/feed-player/context/provider";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

import { useSwiper } from "swiper/react";
import { useCallback, useMemo, lazy, Suspense } from "react";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { ComponentProps } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type PlayerProps = {
  post: PostDetailsType;
  index: number;
  isSectioned?: boolean;
  isActive: boolean;
  isNext: boolean;
  isPrev: boolean;
  isVisible: boolean;
  totalVideos?: number;
  onReactionStateChange?: (
    videoId: string,
    videoSlug: string,
    isReacted: boolean
  ) => void;
  onCommunityJoinStatusChange: ComponentProps<
    typeof ControlLayer
  >["onCommunityJoinStatusChange"];
  onGroupJoinStatusChange: ComponentProps<
    typeof ControlLayer
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange: ComponentProps<
    typeof ControlLayer
  >["onGroupSubscriptionChange"];
  onCommentCountChange: ComponentProps<
    typeof ControlLayer
  >["onCommentCountChange"];
  onAdStarted?: ComponentProps<typeof PlayerProvider>["onAdStarted"];
  onAdEnded?: ComponentProps<typeof PlayerProvider>["onAdEnded"];
  onSwiperToggle?: (disable: boolean) => void;
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
  totalVideos,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  onCommentCountChange,
  onAdStarted,
  onAdEnded,
  onSwiperToggle,
}: PlayerProps) {
  const { showExpandView, toggleExpandView, activeIndex, variant } =
    useFeedContext();
  const { muted } = useBaseContext();
  // const { isActive, isNext, isPrev, isVisible } = useSwiperSlide();
  const swiper = useSwiper();
  const { showGestureOverlay } = useGestureOverlayManager();
  const {
    view: { brandLayoutType },
    video: { videoCrop },
  } = useEmbedConfigs();

  // Detect accessibility mode based on browser accessibility preferences
  const isAccessibilityMode = useMemo(() => detectAccessibilityMode(), []);

  const handleTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      if (video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100;

        if (activeIndex === 1 && progress >= 50) {
          showGestureOverlay("PLAY_PAUSE", muted);
        }
      }
    },
    [activeIndex, muted, showGestureOverlay]
  );

  // load player when the post is active or previous/next post is active or the post is visible
  // For accessibility mode, always load to help with keyboard navigation and screen readers
  if (isAccessibilityMode || isActive || isNext || isPrev || isVisible)
    return (
      <PlayerProvider
        isActive={isActive}
        videoId={post.video.id}
        videoUrl={post.video.source}
        showExpandView={showExpandView}
        toggleExpandView={toggleExpandView}
        swiper={swiper}
        index={index}
        onPlayerIterationEnd={() => swiper.slideNext()}
        totalVideos={totalVideos}
        activeIndex={activeIndex}
        onAdStarted={onAdStarted}
        onAdEnded={onAdEnded}
      >
        <div
          className={cn(
            "gencl:group gencl:relative gencl:h-full gencl:w-full gencl:overflow-clip",
            {
              "gencl:sm:rounded-xl!": !showExpandView,
            },
            {
              "gencl:sm:rounded!": brandLayoutType === "iheart",
            }
          )}
          // tabIndex={showExpandView ? 0 : -1}
          // role="region"
          // aria-label={`Video ${index + 1} - ${post.video.attributes?.title || post.video.descritptionText || "Video content"}`}
        >
          <Suspense fallback={null}>
            <FeedPlayer
              videoId={post.video.id}
              videoDescription={post.video.descritptionText}
              src={post.video.source}
              adUrl={post.video.adUrl ?? undefined}
              id={"feed-player--" + post.video.id}
              poster={post.video.thumbnail ?? ""}
              className={cn(
                "gencl:h-full! gencl:w-full",
                videoCrop
                  ? "gencl:object-cover gencl:bg-cover!"
                  : "gencl:object-contain gencl:bg-contain!"
              )}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                showGestureOverlay("SWIPE");
              }}
              style={{ height: "inherit" }}
            />
          </Suspense>
          <Suspense fallback={null}>
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
            />
          </Suspense>
        </div>
      </PlayerProvider>
    );
}
