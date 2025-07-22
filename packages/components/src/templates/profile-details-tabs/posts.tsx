"use client";
import { useCallback, useMemo, useState } from "react";

import { PostsGrid } from "@genuin/components/organisms/posts-grid";
import { useGetProfileVideos } from "@genuin/components/react-query/api/profile/posts";
import type { VideoType } from "@genuin/components/react-query/api/profile/posts/schema";

import { FeedViewWrapper } from "./feed-view-wrapper";

export function Posts({
  profileId,
  communityId,
  loopId,
  initialVideos,
  forBrand,
  totalVideos = 0,
}: {
  profileId: string;
  communityId: string;
  loopId: string;
  initialVideos: VideoType[];
  forBrand: boolean;
  totalVideos: number;
}) {
  // post id from which the expand view is opened
  const [expandViewId, setExpandViewId] = useState<undefined | string>(
    undefined
  );
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGetProfileVideos(
    profileId,
    loopId,
    communityId,
    forBrand,
    initialVideos,
    totalVideos
  );

  const videos = useMemo(
    () => data.pages.flatMap((page) => page.videos),
    [data]
  );

  const handlePostTileClick = useCallback((postId: string) => {
    setExpandViewId(postId);
  }, []);

  return (
    <>
      <PostsGrid
        gridClassName="gencl:grid-cols-3!"
        className="gencl:p-4 gencl:bg-secondary-50"
        posts={videos.map((video) => ({
          imageUrl: video.thumbnail ?? "",
          postId: video.id,
          stats: {
            comments: video.noOfComments ?? 0,
            reactions: video.sparkCount ?? 0,
            views: video.noOfViews ?? 0,
          },
        }))}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
        isError={isError}
        lazyLoad="manual"
        onPostTileClick={handlePostTileClick}
      >
        {hasNextPage && !isFetchingNextPage && (
          <div
            className="gencl:flex-center gencl:pt-4 gencl:text-body-1-semi-bold gencl:text-secondary-600 gencl:cursor-pointer"
            onClick={() => fetchNextPage()}
          >
            View more
          </div>
        )}
      </PostsGrid>
      {expandViewId !== undefined && (
        <FeedViewWrapper
          profileId={profileId}
          forBrand={forBrand}
          videoId={expandViewId}
          onCloseExpandView={() => setExpandViewId(undefined)}
        />
      )}
    </>
  );
}
