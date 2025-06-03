import { cn } from "@genuin/ui/utils";
import { useEffect, useMemo, type ComponentProps } from "react";

import "swiper/css";
import { useWindowSize } from "usehooks-ts";

import { useBaseContext } from "src/context/base";
import { PostSidePanel } from "src/organisms";
import { PlayerList } from "src/organisms/player-swiper";
import { useFeed } from "src/react-query/api/feed";
import type { FeedType } from "src/types/post";

import { FeedContextProvider, useFeedContext } from "./context";

type FeedPropsType = {
  feedType: FeedType;
  /**
   * Enable expand view for the feed.
   * This will allow the user to expand the feed to full screen.
   * @default true
   */
  enableExpandView?: boolean;
} & ComponentProps<"div">;

export function Feed({ feedType, ...restProps }: FeedPropsType) {
  return (
    <FeedContextProvider>
      <FeedComponent feedType={feedType} {...restProps} />
    </FeedContextProvider>
  );
}

function FeedComponent({
  feedType,
  className,
  style,
  ...restProps
}: FeedPropsType) {
  const { height } = useWindowSize();
  const { feedVideoSizeBox } = useBaseContext();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(feedType);
  const { setActiveIndex, activeIndex, showExpandView } = useFeedContext();

  const videos = useMemo(
    () => data?.pages.flatMap((page) => page.feed),
    [data]
  );

  // this useEffect is used to fetch the next page of videos when the user scrolls to the end of the list.
  // it checks if there is a next page and if the user is not already fetching the next page.
  // if there is a next page and the user is not already fetching the next page, it fetches the next page.
  // it also checks if the user is at the end of the list (3 videos from the end) and if so, it fetches the next page.
  // this is done to avoid fetching too many pages at once and to improve performance.
  useEffect(() => {
    if (!videos) return;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      videos?.length - 3 === activeIndex
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, videos, activeIndex, fetchNextPage]);

  // TODO: Create a shimmer for feed.
  if (isLoading) {
    return <div>Loading</div>;
  }

  if (videos && videos.length !== 0) {
    return (
      <div
        className={cn(
          "gencl:grid gencl:mt-4 gencl:w-full gencl:pr-4 gencl:h-full gencl:grid-cols-2 gencl:gap-4",
          {
            "gencl:fixed gencl:top-0 gencl:flex gencl:items-center gencl:mt-0 gencl:z-50 gencl:left-0 gencl:h-full gencl:w-full gencl:bg-black":
              showExpandView,
          },
          className
        )}
        style={{
          height: showExpandView ? height : feedVideoSizeBox.height,
          ...style,
        }}
        {...restProps}
      >
        <PlayerList
          posts={videos}
          onActiveIndexChange={(newIndex) => {
            setActiveIndex(newIndex);
          }}
        />
        {videos[activeIndex] && !showExpandView && (
          <PostSidePanel
            postDetails={videos?.[activeIndex]}
            style={{ height: feedVideoSizeBox.height }}
          />
        )}
      </div>
    );
  }
}
