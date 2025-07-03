import { cn } from "@genuin/ui/utils";
import { useBaseContext } from "@genuin/components/context/base";
import {
  ControlLayer,
  FeedPlayer,
} from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { useSwiper, useSwiperSlide } from "swiper/react";
import { useWindowSize } from "usehooks-ts";
import { useCallback, useEffect, useState } from "react";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { ComponentProps } from "react";
import { REEL_ASPECT_RATIO } from "@genuin/components/lib/constants";

type PlayerProps = {
  post: PostDetailsType;
  onCommunityJoinStatusChange: ComponentProps<
    typeof ControlLayer
  >["onCommunityJoinStatusChange"];
  onGroupJoinStatusChange: ComponentProps<
    typeof ControlLayer
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange: ComponentProps<
    typeof ControlLayer
  >["onGroupSubscriptionChange"];
};

export function Player({
  post,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
}: PlayerProps) {
  const { showExpandView, toggleExpandView, activeIndex } = useFeedContext();
  const { height } = useWindowSize();
  const { feedVideoSizeBox, muted } = useBaseContext();
  const { isActive } = useSwiperSlide();
  const swiper = useSwiper();
  const [swiperSlideHeight, setSwiperSlideHeight] = useState<
    number | undefined
  >(undefined);
  const { showGestureOverlay } = useGestureOverlayManager();

  useEffect(() => {
    function handleResize() {
      setSwiperSlideHeight(swiper?.slides[0]?.offsetHeight);
    }
    swiper.on("resize", handleResize);
    return () => {
      swiper.off("resize", handleResize);
    };
  }, [swiper]);

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

  return (
    <PlayerProvider
      isActive={isActive}
      videoId={post.video.id}
      showExpandView={showExpandView}
      toggleExpandView={toggleExpandView}
      swipeNext={swiper.slideNext}
    >
      <div
        className={cn(
          "gencl:group gencl:relative gencl:h-full gencl:overflow-clip",
          {
            "gencl:rounded-xl": !showExpandView,
          }
        )}
      >
        <FeedPlayer
          postDetails={post}
          src={post.video.source}
          id={post.video.id}
          poster={post.video.thumbnail ?? ""}
          className={cn(
            "gencl:bg-secondary-200 gencl:object-cover gencl:aspect-reel"
          )}
          playsInline
          style={{
            width: showExpandView
              ? height * REEL_ASPECT_RATIO
              : swiperSlideHeight
                ? swiperSlideHeight * REEL_ASPECT_RATIO
                : feedVideoSizeBox.width,
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            showGestureOverlay("SWIPE");
          }}
        />
        <ControlLayer
          isActive={isActive}
          postDetails={post}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
        />
      </div>
    </PlayerProvider>
  );
}
