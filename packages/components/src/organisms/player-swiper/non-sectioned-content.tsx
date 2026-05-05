import { lazy, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { SwiperSlide } from "swiper/react";
import type { Swiper } from "swiper/types";

import { useAnalytics } from "@genuin/components/context/analytics/context";

import { SwiperImplementation } from "./swiper-implementation";

const Player = lazy(() => import("./player").then((m) => ({ default: m.Player })));

const WatchBoundaryOverlay = lazy(() =>
  import("@genuin/components/molecules/feed-player/control-layer/watch-boundary-overlay").then((m) => ({
    default: m.WatchBoundaryOverlay,
  }))
);

interface NonSectionedContentProps {
  startIndex: number;
  slideDimensions: {
    slideWidth: number;
    slideHeight: number;
    slidesPerView: number;
  } | null;
  disableSwiper: boolean;
  websiteType: string;
  setVerticalSwipers: Dispatch<SetStateAction<Record<number, Swiper>>>;
  onActiveIndexChange?: (index: number) => void;
  brandLayoutType: string;
  isDesktop: boolean;
  setEndOfFeedReached: (value: boolean) => void;
  isEndOfFeedReached: boolean;
  filteredPost: any[];
  onCommunityJoinStatusChange: any;
  onGroupJoinStatusChange: any;
  onGroupSubscriptionChange: any;
  onReactionStateChange?: (videoId: string, videoSlug: string, isReacted: boolean) => void;
  onCommentCountChange?: any;
  totalVideos?: number;
  isSectioned: boolean;
  onAdFilled?: (type: string, index: number) => void;
  onAdPlaybackEnd: (index: number) => void;
  /** Feed-session identifier from the first feed API page, forwarded to analytics. */
  pageSession?: string | null;
}

export function NonSectionedContent({
  startIndex,
  slideDimensions,
  disableSwiper,
  websiteType,
  setVerticalSwipers,
  onActiveIndexChange,
  brandLayoutType,
  isDesktop,
  setEndOfFeedReached,
  isEndOfFeedReached,
  filteredPost,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  onCommentCountChange,
  totalVideos,
  isSectioned,
  onAdFilled,
  onAdPlaybackEnd,
  pageSession,
}: NonSectionedContentProps) {
  const { track, EventName } = useAnalytics();
  return (
    <SwiperImplementation
      initialSlide={startIndex}
      slidesPerView={slideDimensions?.slidesPerView ? (disableSwiper || websiteType === "legacy" ? 1 : 1.2) : undefined}
      spaceBetween={slideDimensions?.slidesPerView ? 16 : undefined}
      onSwiper={(swiper: Swiper) => {
        setVerticalSwipers((prev) => ({
          ...prev,
          [0]: swiper,
        }));
      }}
      onActiveIndexChange={(swiper: Swiper) => {
        onActiveIndexChange?.(swiper.activeIndex);

        if (brandLayoutType === "iheart" && isDesktop) {
          swiper.disable();
          setTimeout(() => {
            swiper.enable();
          }, 300);
        }
      }}
      disableScroll={disableSwiper}
      onReachEnd={(swiper: Swiper) => {
        // Guard against spurious reachEnd fired when expand mode changes Swiper geometry:
        if (swiper.activeIndex < filteredPost.length - 1) return;
        setEndOfFeedReached(true);
      }}
      onSlideChange={() => {
        if (isEndOfFeedReached) setEndOfFeedReached(false);
      }}
      onSlidePrevTransitionStart={() => track(EventName.SWIPE_PREVIOUS)}
      onSlideNextTransitionStart={() => track(EventName.SWIPE_NEXT)}>
      {filteredPost.map((post, index) => (
        <SwiperSlide
          key={post.video.id}
          virtualIndex={index}
          style={
            slideDimensions
              ? {
                  width: `${slideDimensions.slideWidth}px`,
                  height: `${slideDimensions.slideHeight}px`,
                }
              : undefined
          }>
          {({ isActive, isNext, isPrev, isVisible }) => (
            <>
              {post.video.type === "video" ? (
                <Suspense fallback={null}>
                  <Player
                    isActive={isActive}
                    isNext={isNext}
                    isPrev={isPrev}
                    isVisible={isVisible}
                    post={post}
                    totalVideos={totalVideos}
                    isSectioned={isSectioned}
                    onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                    onGroupJoinStatusChange={onGroupJoinStatusChange}
                    onGroupSubscriptionChange={onGroupSubscriptionChange}
                    onReactionStateChange={onReactionStateChange}
                    onCommentCountChange={onCommentCountChange}
                    index={index}
                    onAdFilled={onAdFilled}
                    onAdPlaybackEnd={onAdPlaybackEnd}
                    pageSession={pageSession}
                  />
                </Suspense>
              ) : post.video.type === "complete" ? (
                <Suspense fallback={null}>
                  <WatchBoundaryOverlay videoDetails={post.video} variant="complete" />
                </Suspense>
              ) : (
                <></>
              )}
            </>
          )}
        </SwiperSlide>
      ))}
    </SwiperImplementation>
  );
}
