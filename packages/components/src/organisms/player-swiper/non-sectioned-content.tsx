import { lazy, Suspense, useCallback } from "react";
import { SwiperSlide } from "swiper/react";
import { SwiperImplementation } from "./swiper-implementation";
import { AdInfoType } from "@genuin/components/molecules/feed-player";

const Player = lazy(() =>
  import("./player.js").then((m) => ({ default: m.Player })),
);

const WatchBoundaryOverlay = lazy(() =>
  import(
    "../../molecules/feed-player/control-layer/watch-boundary-overlay.js"
  ).then((m) => ({ default: m.WatchBoundaryOverlay })),
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
  setVerticalSwipers: (swipers: Record<number, any>) => void;
  onActiveIndexChange?: (index: number) => void;
  brandLayoutType: string;
  isDesktop: boolean;
  setEndOfFeedReached: (value: boolean) => void;
  isEndOfFeedReached: boolean;
  filteredPost: any[];
  onCommunityJoinStatusChange: any;
  onGroupJoinStatusChange: any;
  onGroupSubscriptionChange: any;
  onReactionStateChange?: (
    videoId: string,
    videoSlug: string,
    isReacted: boolean,
  ) => void;
  onCommentCountChange?: any;
  totalVideos?: number;
  isSectioned: boolean;
  onAdStarted?: (event?: AdInfoType) => void;
  onAdEnded?: (event?: AdInfoType) => void;
  onAdFilled?: (type: string, index: number) => void;
  onAdPlaybackEnd: (index: number) => void;
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
  onAdStarted,
  onAdEnded,
  onAdFilled,
  onAdPlaybackEnd,
}: NonSectionedContentProps) {
  return (
    <SwiperImplementation
      initialSlide={startIndex}
      slidesPerView={
        slideDimensions?.slidesPerView
          ? disableSwiper || websiteType === "legacy"
            ? 1
            : 1.2
          : undefined
      }
      spaceBetween={slideDimensions?.slidesPerView ? 16 : undefined}
      onSwiper={(swiper) => {
        setVerticalSwipers((prev) => ({
          ...prev,
          [0]: swiper,
        }));
      }}
      onActiveIndexChange={(swiper: any) => {
        onActiveIndexChange?.(swiper.activeIndex);

        if (brandLayoutType === "iheart" && isDesktop) {
          swiper.disable();
          setTimeout(() => {
            swiper.enable();
          }, 300);
        }
      }}
      disableScroll={disableSwiper}
      onReachEnd={() => {
        setEndOfFeedReached(true);
      }}
      onSlideChange={() => {
        if (isEndOfFeedReached) setEndOfFeedReached(false);
      }}
    >
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
          }
        >
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
                    onAdEnded={onAdEnded}
                    onAdStarted={onAdStarted}
                    onAdFilled={onAdFilled}
                    onAdPlaybackEnd={onAdPlaybackEnd}
                  />
                </Suspense>
              ) : post.video.type === "complete" ? (
                <Suspense fallback={null}>
                  <WatchBoundaryOverlay
                    videoDetails={post.video}
                    variant="complete"
                  />
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
