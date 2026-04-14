import { lazy, Suspense } from "react";
import { SwiperSlide } from "swiper/react";
import { cn } from "@genuin/ui/lib/utils";
import { useAnalytics } from "@genuin/components/context";
import { Player } from "./player";
import { SwiperImplementation } from "./swiper-implementation";
import { AdInfoType } from "@genuin/components/molecules/feed-player";

const WatchBoundaryOverlay = lazy(() =>
  import(
    "../../molecules/feed-player/control-layer/watch-boundary-overlay.js"
  ).then((m) => ({ default: m.WatchBoundaryOverlay })),
);

interface SectionedContentProps {
  sectionList: any[];
  embedDetails: any;
  filteredPost: any[];
  startIndex: number;
  slideDimensions: {
    slideWidth: number;
    slideHeight: number;
    slidesPerView: number;
  } | null;
  disableSwiper: boolean;
  websiteType: string;
  onActiveIndexChange?: (index: number) => void;
  setEndOfFeedReached: (value: boolean) => void;
  isEndOfFeedReached: boolean;
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
  isMobile: boolean;
  setHorizontalSwiper: (swiper: any) => void;
  setActiveHorizontalIndex: (index: number) => void;
  setVerticalSwipers: (swipers: Record<number, any>) => void;
  onAdStarted: (event?: AdInfoType) => void;
  onAdEnded: (event?: AdInfoType) => void;
  onAdFilled?: (type: string, index: number) => void;
  onAdPlaybackEnd?: (index: number) => void;
}

export function SectionedContent({
  sectionList,
  embedDetails,
  filteredPost,
  startIndex,
  slideDimensions,
  disableSwiper,
  websiteType,
  onActiveIndexChange,
  setEndOfFeedReached,
  isEndOfFeedReached,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  onCommentCountChange,
  totalVideos,
  isSectioned,
  isMobile,
  setHorizontalSwiper,
  setActiveHorizontalIndex,
  setVerticalSwipers,
  onAdFilled,
  onAdPlaybackEnd,
}: SectionedContentProps) {
  const { track, EventName } = useAnalytics();

  return (
    <SwiperImplementation
      direction="horizontal"
      className={cn(
        "gencl:h-full gencl:aspect-reel",
        isMobile && "gencl:h-full gencl:w-full",
      )}
      onSwiper={setHorizontalSwiper}
      onActiveIndexChange={(swiper: any) => {
        setActiveHorizontalIndex(swiper.activeIndex);
        if (sectionList) {
          embedDetails?.updateSelectedSection(sectionList[swiper.activeIndex]);
        }
      }}
      disableScroll={disableSwiper}
    >
      {sectionList?.map((item, sectionIdx) => (
        <SwiperSlide key={item?.id || sectionIdx} virtualIndex={sectionIdx}>
          {({ isActive: isHorizontalActive }) => (
            <SwiperImplementation
              className="gencl:h-full"
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
                  [sectionIdx]: swiper,
                }));
              }}
              onActiveIndexChange={(swiper: any) => {
                onActiveIndexChange?.(swiper.activeIndex);
                track(EventName.SECTION_CHANGES, {
                  section_id: item?.id,
                });
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
                  {({
                    isActive: isVerticalActive,
                    isNext: isVerticalNext,
                    isPrev: isVerticalPrev,
                    isVisible: isVerticalVisible,
                  }) => {
                    const isTrulyActive =
                      isVerticalActive && isHorizontalActive;
                    const isTrulyNext = isVerticalNext && isHorizontalActive;
                    const isTrulyPrev = isVerticalPrev && isHorizontalActive;
                    const isTrulyVisible =
                      isVerticalVisible && isHorizontalActive;

                    return post.video.type === "video" ? (
                      <Player
                        isActive={isTrulyActive}
                        isNext={isTrulyNext}
                        isPrev={isTrulyPrev}
                        isVisible={isTrulyVisible}
                        post={post}
                        isSectioned={isSectioned}
                        onCommunityJoinStatusChange={
                          onCommunityJoinStatusChange
                        }
                        onGroupJoinStatusChange={onGroupJoinStatusChange}
                        onGroupSubscriptionChange={onGroupSubscriptionChange}
                        onReactionStateChange={onReactionStateChange}
                        onCommentCountChange={onCommentCountChange}
                        index={index}
                        totalVideos={totalVideos}
                        onAdFilled={onAdFilled}
                        onAdPlaybackEnd={onAdPlaybackEnd}
                      />
                    ) : post.video.type === "complete" ? (
                      <Suspense fallback={null}>
                        <WatchBoundaryOverlay
                          videoDetails={post.video}
                          variant="complete"
                        />
                      </Suspense>
                    ) : (
                      <></>
                    );
                  }}
                </SwiperSlide>
              ))}
            </SwiperImplementation>
          )}
        </SwiperSlide>
      ))}
    </SwiperImplementation>
  );
}
