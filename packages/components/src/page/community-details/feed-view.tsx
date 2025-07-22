import { useMemo } from "react";
import { FeedView } from "@genuin/components/templates/feed";
import { useGetCommunityFeed } from "@genuin/components/react-query/api/community/feed";
import { getQueryKeyForCommunityFeed } from "@genuin/components/react-query/keys/community";

/**
 * This component renders the community feed view.
 */
export function CommunityFeedView({
  communitySlug,
}: {
  communitySlug: string;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetCommunityFeed(communitySlug, "");

  const feed = useMemo(
    () => data?.pages.flatMap((page) => page.feed) ?? [],
    [data]
  );

  return (
    <FeedView
      startIndex={0}
      feedData={{
        videos: feed,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        queryKey: getQueryKeyForCommunityFeed(communitySlug, ""),
      }}
    />
  );
}
