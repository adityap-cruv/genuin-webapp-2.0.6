import { DecorativeList } from "@genuin/ui/decorative-list";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { useCallback, useMemo, useState } from "react";

import { GroupSubscriptionButton } from "@molecules/group-subscription-button";
import { JoinCommunityButton } from "@molecules/join-community-button";
import { JoinGroupButton } from "@molecules/join-group-button";
import { ShareButton } from "@molecules/share-button";
import { Tag } from "@molecules/tag";
import { GenericDetails } from "@organisms/generic-details";
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
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { CommunityListSkeleton } from "./skeleton";
import { CommunityGroupsSkeleton } from "../community-details-tabs";

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

  if (isLoading) {
    return <CommunityListSkeleton />;
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
                url={buildPageUrl({
                  type: "community",
                  slug: community.slug,
                })}
                metadata={
                  <GenericDetailsMetadata
                    stats={{
                      Members: community.noOfMembers,
                      Groups: community.noOfGroups,
                      Posts: community.noOfVideos,
                    }}
                    handle={{
                      url: buildPageUrl({
                        type: "community",
                        slug: community.slug,
                      }),
                      userName: community.slug,
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
                        url={buildPageUrl({
                          type: "brand",
                          slug: community.brand?.slug ?? "",
                        })}
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
                  totalLoops={community.noOfGroups}
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
  totalLoops = 0,
}: {
  profileId: string;
  communityId: string;
  initialLoops: LoopType[];
  forBrand: boolean;
  totalLoops: number;
}) {
  const {
    isLoading,
    isError,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetProfileGroups(
    profileId,
    communityId,
    forBrand,
    initialLoops,
    totalLoops
  );

  const groups = useMemo(() => {
    return data?.pages.flatMap((page) => page.loops) ?? [];
  }, [data]);

  if (isLoading) {
    return <CommunityGroupsSkeleton />;
  }

  // TODO: handle error state.
  if (isError || !groups) {
    return <div>Error loading groups.</div>;
  }

  return (
    <>
      {groups.map((group) => {
        return (
          <li key={group.id}>
            <GenericDetails
              className="gencl:overflow-clip"
              variant="list"
              url={buildPageUrl({
                type: "group",
                slug: group.slug,
              })}
              title={group.name}
              key={group.id}
              metadata={
                <GenericDetailsMetadata
                  privacyInfo={{ isPrivate: group.isPrivate }}
                  stats={{
                    Members: group.noOfMembers,
                    Posts: group.noOfVideos,
                    Views: group.noOfViews,
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
                totalVideos={group.noOfVideos}
              />
            </GenericDetails>
          </li>
        );
      })}
      {/* TODO: add lazy load shimmer here. */}
      {isFetchingNextPage && (
        <li>
          <div className="gencl:animate-pulse gencl:h-4 gencl:bg-gray-200"></div>
          Loading more groups...
        </li>
      )}
      {hasNextPage && !isFetchingNextPage && (
        <li>
          <div
            onClick={() => fetchNextPage()}
            className="gencl:bg-secondary-50 gencl:cursor-pointer gencl:py-4 gencl:border gencl:flex gencl:w-full gencl:justify-center gencl:text-body-1-semi-bold gencl:text-secondary-600 gencl:border-secondary-150 gencl:rounded-xl"
          >
            View more groups
          </div>
        </li>
      )}
    </>
  );
}

function GroupVideos({
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
