import { lazy, useMemo, Suspense } from "react";

import { useGetProfileFeed } from "@react-query/api/profile/posts";
import { getQueryKeyForProfileFeed } from "@react-query/keys/profile";

const FeedView = lazy(() =>
  import("@templates/feed").then((module) => ({
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
  videoId: string;
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
    () => feedData?.pages.flatMap((page) => page.feed) ?? [],
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
          queryKey: getQueryKeyForProfileFeed(profileId, forBrand, videoId),
        }}
      />
    </Suspense>
  );
}
