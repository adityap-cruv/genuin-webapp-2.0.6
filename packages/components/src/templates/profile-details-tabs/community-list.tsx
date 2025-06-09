import { DecorativeList } from "@genuin/ui/decorative-list";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { useCallback, useMemo, useState } from "react";

import { GroupSubscriptionButton } from "@molecules/group-subscription-button";
import { JoinCommunityButton } from "@molecules/join-community-button";
import { JoinGroupButton } from "@molecules/join-group-button";
import { ShareButton } from "@molecules/share-button";
import { Tag } from "@molecules/tag";
import { GenericDetails } from "@organisms";
import { GenericDetailsMetadata } from "@organisms/generic-details/generic-details-metadata";
import { PostsGrid } from "@organisms/posts-grid";
import {
  useGetProfileCommunities,
  useGetProfileGroups,
  useGetProfileVideos,
} from "@react-query/api/profile/posts";
import type {
  LoopType,
  VideoType,
} from "@react-query/api/profile/posts/schema";

import { FeedViewWrapper } from "./feed-view-wrapper";

export function CommunityList({
  userId,
  forBrand,
}: {
  userId: string;
  forBrand: boolean;
}) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProfileCommunities(userId, forBrand);

  const communities = useMemo(
    () => data?.pages.flatMap((page) => page.communities) ?? [],
    [data]
  );

  // TODO: HANDLE THE LOADING STATE
  if (isLoading) {
    return <div>Loading communities...</div>;
  }

  // TODO: HANDLE THE ERROR STATE
  if (isError || !communities) {
    return <div>Error loading communities.</div>;
  }

  // TODO: HANDLE THE CASE WHEN THERE ARE NO COMMUNITIES
  if (communities.length === 0) {
    return <div>No communities found</div>;
  }

  // Placeholder for community list component
  return (
    <div className="gencl:w-full gencl:space-y-6 gencl:pb-6">
      <InfiniteScroll
        getNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoadingNextPage={isFetchingNextPage}
      >
        {communities.map((community) => {
          return (
            <div className="gencl:w-full" key={community.id}>
              <GenericDetails
                className="gencl:border-none gencl:[&>div]:p-0"
                title={community.name}
                url={`/test/${community.slug}`}
                metadata={
                  <GenericDetailsMetadata
                    stats={{
                      Members: community.noOfMembers,
                      Groups: community.noOfGroups,
                      Posts: community.noOfVideos,
                    }}
                    privacyInfo={{
                      isPrivate: community.isPrivate,
                    }}
                  />
                }
                variant="list"
                profileImageDetails={{
                  imageUrl: community.profileImage ?? "",
                  isAvatar: false,
                  alt: community.name ?? "",
                }}
                ctas={
                  <div className="gencl:flex gencl:gap-2">
                    {community.brand && (
                      <Tag
                        alt={community.brand?.name}
                        url={`/brand/${community.brand?.slug}`}
                        profileImage={{ url: community.brand.logo }}
                        userName={community.brand?.name}
                      />
                    )}
                    <JoinCommunityButton buttonText="Join" />
                    <ShareButton showText />
                  </div>
                }
              />
              <DecorativeList className="gencl:ml-7 gencl:[&_li]:mb-6">
                <div className="gencl:h-6" />
                <Groups
                  profileId={userId}
                  communityId={community.id}
                  initialLoops={community.loops}
                  forBrand={forBrand}
                />
              </DecorativeList>
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}

// TODO:  use <GroupCard/> component here.
function Groups({
  profileId,
  communityId,
  initialLoops,
  forBrand,
}: {
  profileId: string;
  communityId: string;
  initialLoops: LoopType[];
  forBrand: boolean;
}) {
  const { isLoading, isError, data } = useGetProfileGroups(
    profileId,
    communityId,
    forBrand,
    initialLoops
  );

  const groups = useMemo(() => {
    return data?.pages.flatMap((page) => page.loops) ?? [];
  }, [data]);

  // TODO: handle loading state.
  if (isLoading) {
    return <div>Loading groups...</div>;
  }

  // TODO: handle error state.
  if (isError || !groups) {
    return <div>Error loading groups.</div>;
  }

  return groups.map((group) => {
    return (
      <li key={group.id}>
        <GenericDetails
          className="gencl:overflow-clip"
          variant="list"
          title={group.name}
          key={group.id}
          metadata={
            <GenericDetailsMetadata
              privacyInfo={{ isPrivate: group.isPrivate }}
              stats={{
                members: group.noOfMembers,
                posts: group.noOfVideos,
                views: group.noOfViews,
              }}
            />
          }
          ctas={
            <div className="gencl:flex gencl:gap-2 gencl:items-center">
              <JoinGroupButton buttonText="Join" />
              <GroupSubscriptionButton showText={false} />
              <ShareButton showText={false} />
            </div>
          }
        >
          <GroupVideos
            communityId={communityId}
            initialVideos={group.videos}
            loopId={group.id}
            profileId={profileId}
            forBrand={forBrand}
          />
        </GenericDetails>
      </li>
    );
  });
}

function GroupVideos({
  profileId,
  communityId,
  loopId,
  initialVideos,
  forBrand,
}: {
  profileId: string;
  communityId: string;
  loopId: string;
  initialVideos: VideoType[];
  forBrand: boolean;
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
    communityId,
    loopId,
    forBrand,
    initialVideos
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
        className="gencl:p-4 gencl:bg-secondary-50"
        posts={videos.map((video) => ({
          imageUrl: video.thumbnail ?? "",
          postId: video.id,
          stats: {
            comments: 0,
            shares: 0,
            views: 0,
          },
        }))}
        hasNextPage={false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
        isError={isError}
        lazyLoad="manual"
        onPostTileClick={handlePostTileClick}
      >
        {hasNextPage && !isFetchingNextPage && (
          <div
            className="gencl:flex-center gencl:pt-4 gencl:text-body-2-bold gencl:text-secondary-600 gencl:cursor-pointer"
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
