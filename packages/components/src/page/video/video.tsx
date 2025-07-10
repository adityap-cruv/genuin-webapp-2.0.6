"use client";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { useGetVideoDetails } from "@genuin/components/react-query/api/video";
import { getQueryKeyForVideoDetails } from "@genuin/components/react-query/keys/video";
import { FeedView } from "@genuin/components/templates/feed";

export function VideoPage({ videoId }: { videoId: string }) {
  const { data, isLoading, isError } = useGetVideoDetails(videoId);
  if (isError) {
    return <ErrorState type="NO_VIDEO" />;
  }
  return (
    <FeedView
      feedData={{
        fetchNextPage: () => {},
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading,
        queryKey: getQueryKeyForVideoDetails(videoId),
        videos: data ? [data] : [],
      }}
    />
  );
}
