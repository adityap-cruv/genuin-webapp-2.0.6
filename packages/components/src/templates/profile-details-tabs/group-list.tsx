"use client";
import { useMemo } from "react";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import {
  setQueryDataForGroupJoinStatusInProfileGroups,
  setQueryDataForGroupSubscribeInProfileGroups,
  useGetProfileGroups,
} from "@genuin/components/react-query/api/profile/posts";
import type { LoopType } from "@genuin/components/react-query/api/profile/posts/schema";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { CommunityGroupsSkeleton } from "../community-details-tabs";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { Posts } from "./posts";
import { GroupDetailsType } from "@genuin/components/react-query/api/group/details";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

// TODO:  use <GroupCard/> component here.
export function Groups({
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
              metadata={<GroupMetadata group={group} />}
              ctas={
                <div className="gencl:sm:!flex gencl:hidden gencl:gap-2 gencl:items-center">
                  <JoinGroupButton
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
                <Posts
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
            className="gencl:bg-secondary-50 gencl:cursor-pointer gencl:sm:!py-4 gencl:py-2 gencl:border gencl:flex gencl:w-full gencl:justify-center gencl:text-body-1-semi-bold gencl:text-secondary-600 gencl:border-secondary-150 gencl:rounded-lg gencl:sm:!rounded-xl"
          >
            View more groups
          </div>
        </li>
      )}
    </>
  );
}

function GroupMetadata({ group }: { group: LoopType }) {
  return (
    <GenericDetailsMetadata
      privacyInfo={{ isPrivate: group.isPrivate }}
      stats={{
        Members: group.noOfMembers,
        Posts: group.noOfVideos,
        Views: group.noOfViews,
      }}
    />
  );
}
