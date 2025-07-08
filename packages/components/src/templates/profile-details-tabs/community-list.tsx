"use client";
import { DecorativeList } from "@genuin/ui/decorative-list";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { useCallback, useMemo, useState } from "react";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { Tag } from "@genuin/components/molecules/tag";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { PostsGrid } from "@genuin/components/organisms/posts-grid";
import {
  setQueryDataForGroupJoinStatusInProfileGroups,
  setQueryDataForGroupSubscribeInProfileGroups,
  setQueryDataForJoinCommunityInProfileCommunities,
  useGetProfileCommunities,
  useGetProfileGroups,
  useGetProfileVideos,
} from "@genuin/components/react-query/api/profile/posts";
import type {
  LoopType,
  VideoType,
} from "@genuin/components/react-query/api/profile/posts/schema";

import { FeedViewWrapper } from "./feed-view-wrapper";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { CommunityListSkeleton } from "./skeleton";
import { CommunityGroupsSkeleton } from "../community-details-tabs";
import { CommunityUserRole } from "@genuin/components/types/post";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";

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

  const handleCommunityJoinStatusChange = useCallback(
    (communityId: string, newRole: CommunityUserRole) => {
      setQueryDataForJoinCommunityInProfileCommunities(
        newRole,
        communityId,
        userId,
        forBrand
      );
    },
    [forBrand, userId]
  );

  if (isLoading) {
    return <CommunityListSkeleton />;
  }

  if (isError) {
    return <ComponentErrorState type="WARNING" />;
  }

  if (!communities || communities.length === 0) {
    return <ComponentErrorState type="NO_COMMUNITIES" />;
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
          const showPrivateCommunityAccess =
            community.isPrivate &&
            (community.role === "UNJOINED" || community.role === "REQUESTED");
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
                    className="gencl:pt-2"
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
                  <div className="gencl:flex gencl:gap-2 gencl:items-center">
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
                    {community.isPrivate && (
                      <JoinCommunityButton
                        roleTexts={{ UNJOINED: "Join" }}
                        communityId={community.id}
                        communityHandle={community.handle}
                        communityName={community.name}
                        slug={community.slug}
                        role={community.role}
                        isPrivate={community.isPrivate}
                        onCommunityJoinStatusChange={(newRole) =>
                          handleCommunityJoinStatusChange(community.id, newRole)
                        }
                      />
                    )}
                    <ShareButton
                      size="sm"
                      pathName={buildPageUrl({
                        type: "community",
                        slug: community.slug,
                      })}
                    />
                  </div>
                }
              />
              {showPrivateCommunityAccess ? (
                <ComponentErrorState
                  type="PRIVATE_COMMUNITY"
                  forList
                  className="gencl:rounded-xl gencl:mt-4"
                />
              ) : (
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
              )}
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

  if (isError) {
    return (
      <li>
        <ComponentErrorState type="WARNING" />
      </li>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <li>
        <ComponentErrorState type="NO_GROUPS" />
      </li>
    );
  }

  return (
    <>
      {groups.map((group) => {
        const showPrivateGroupAccess =
          group.isPrivate && group.role !== "JOINED";

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
                  className="gencl:pt-2"
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
                  <JoinGroupButton
                    size="sm"
                    buttonTexts={{
                      UNJOINED: "Join",
                    }}
                    groupId={group.id}
                    groupName={group.name ?? ""}
                    groupDescription={""}
                    shareUrl={group.shareUrl ?? ""}
                    isPrivate={group.isPrivate}
                    role={group.role}
                    onGroupJoinStatusChange={(newRole) => {
                      setQueryDataForGroupJoinStatusInProfileGroups({
                        communityId: communityId,
                        newRole,
                        forBrand,
                        loopId: group.id,
                      });
                      // console.log("Group join status changed:", newRole);
                    }}
                  />
                  <GroupSubscriptionButton
                    size="sm"
                    groupId={group.id}
                    groupName={group.name ?? ""}
                    groupDescription={""}
                    shareUrl={group.shareUrl ?? ""}
                    isSubscriber={group.isSubscriber ?? false}
                    onSubscriptionChange={(isSubscribed) => {
                      setQueryDataForGroupSubscribeInProfileGroups({
                        communityId: communityId,
                        isSubscribed,
                        forBrand,
                        loopId: group.id,
                      });
                      // console.log("Group join status changed:", newRole);
                    }}
                    showText={false}
                  />
                  <ShareButton
                    size="sm"
                    showText={false}
                    pathName={buildPageUrl({
                      type: "group",
                      slug: group.slug,
                    })}
                  />
                </div>
              }
            >
              {showPrivateGroupAccess ? (
                <ComponentErrorState type="PRIVATE_GROUP" forList />
              ) : (
                <GroupVideos
                  communityId={communityId}
                  initialVideos={group.videos}
                  loopId={group.id}
                  profileId={profileId}
                  forBrand={forBrand}
                  totalVideos={group.noOfVideos}
                />
              )}
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
            views: 0,
            reactions: 0,
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
