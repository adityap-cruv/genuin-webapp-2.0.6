import { useMemo } from "react";

import { ErrorState } from "@genuin/components/molecules/error-state";
import { useGetProfileFeed } from "@genuin/components/react-query/api/profile/posts";
import { getQueryKeyForProfileFeed } from "@genuin/components/react-query/keys/profile";
import { FeedView } from "@genuin/components/templates/feed";

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
    isError,
  } = useGetProfileFeed(profileId, forBrand, videoId);

  const videos = useMemo(() => feedData?.pages.flatMap((page) => page.feed) ?? [], [feedData]);

  if (isError) {
    return <ErrorState type="ERROR" />;
  }

  if (videos.length === 0 && !isLoading && !isFetchingNextPage) {
    return <ErrorState type="NO_CONTENT" />;
  }

  return (
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
  );
}
