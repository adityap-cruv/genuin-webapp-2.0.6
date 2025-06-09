import { lazy, useMemo, Suspense } from "react";

import { useGetProfileFeed } from "@react-query/api/profile/posts";

const FeedView = lazy(() =>
  import("@templates/feed/index.js").then((module) => ({
    default: module.FeedView,
  }))
);

export function FeedViewWrapper({
  profileId,
  forBrand,
  videoId,
  onCloseExpandView,
}: {
  profileId: string;
  forBrand: boolean;
  videoId?: string;
  onCloseExpandView?: () => void;
}) {
  const {
    data: feedData,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useGetProfileFeed(profileId, forBrand, videoId);

  const videos = useMemo(
    () => feedData?.pages.flatMap((page) => page.videos) ?? [],
    [feedData]
  );

  return (
    <Suspense>
      <FeedView
        defaultExpandView
        onCloseExpandView={onCloseExpandView}
        feedData={{
          videos,
          fetchNextPage,
          hasNextPage,
          isFetchingNextPage,
          isLoading,
        }}
      />
    </Suspense>
  );
}
