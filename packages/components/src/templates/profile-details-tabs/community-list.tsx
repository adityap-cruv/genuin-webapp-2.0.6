"use client";
import { DecorativeList } from "@genuin/ui/decorative-list";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { useCallback, useMemo } from "react";

import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { Tag } from "@genuin/components/molecules/tag";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import {
  setQueryDataForJoinCommunityInProfileCommunities,
  useGetProfileCommunities,
} from "@genuin/components/react-query/api/profile/posts";
import type { CommunityType } from "@genuin/components/react-query/api/profile/posts/schema";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { CommunityListSkeleton } from "./skeleton";
import { CommunityUserRole } from "@genuin/components/types/post";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { Groups } from "./group-list";

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
                metadata={<CommunityMetadata community={community} />}
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
                        className="gencl:sm:inline-flex! gencl:hidden"
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
                      className="gencl:hidden gencl:sm:inline-flex!"
                      showText
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
                <DecorativeList className="gencl:sm:ml-7! gencl:ml-4 gencl:[&_li]:sm:!mb-6 gencl:[&_li]:mb-3">
                  <div className="gencl:sm:!h-6 gencl:h-3" />
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

function CommunityMetadata({ community }: { community: CommunityType }) {
  const { isMobile } = useDeviceDetectMediaQuery();
  return (
    <GenericDetailsMetadata
      stats={
        isMobile
          ? undefined
          : {
              Members: community.noOfMembers,
              Groups: community.noOfGroups,
              Posts: community.noOfVideos,
            }
      }
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
  );
}
