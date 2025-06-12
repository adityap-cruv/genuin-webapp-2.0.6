"use client";
import { GroupPosts } from "@organisms/group-posts";

import { useGetCommunityFeed } from "@react-query/api/community/feed";
import { Suspense, useCallback, useMemo, useState } from "react";
import { FeedView } from "@templates/feed";
import { getQueryKeyForCommunityFeed } from "@react-query/keys/community";

export function Posts({
  groupSlug,
  communitySlug,
}: {
  groupSlug: string;
  communitySlug: string;
}) {
  // State to manage the index of the post to expand
  const [expandViewId, setExpandViewId] = useState<string | null>(null);

  const handlePostTileClick = useCallback((postId: string) => {
    setExpandViewId(postId);
  }, []);

  return (
    <>
      <GroupPosts
        slug={groupSlug}
        className="gencl:bg-secondary-50 gencl:p-4"
        lazyLoad="manual"
        onPostTileClick={handlePostTileClick}
        enableFeedView={false}
      />
      {expandViewId !== null && (
        <Suspense>
          <FeedViewWrapper
            communitySlug={communitySlug}
            startVideoId={expandViewId}
            onCloseExpandView={() => setExpandViewId(null)}
          />
        </Suspense>
      )}
    </>
  );
}

export function FeedViewWrapper({
  communitySlug,
  startVideoId,
  onCloseExpandView = () => {},
}: {
  communitySlug: string;
  startVideoId: string;
  onCloseExpandView?: () => void;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetCommunityFeed(communitySlug, startVideoId);

  const feed = useMemo(
    () => data?.pages.flatMap((page) => page.feed) ?? [],
    [data]
  );

  return (
    <FeedView
      startIndex={0}
      defaultExpandView={true}
      feedData={{
        videos: feed,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        queryKey: getQueryKeyForCommunityFeed(communitySlug, startVideoId),
      }}
      onCloseExpandView={onCloseExpandView}
    />
  );
}
