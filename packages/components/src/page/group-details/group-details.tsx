"use client";
import { useId } from "react";
import { Skeleton } from "@genuin/ui/skeleton";
import { TabsSkeleton } from "@genuin/ui/tabs";
import { convertISOToLocalDateFormate } from "@genuin/ui/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import {
  GenericDetails,
  GenericDetailsSkeleton,
} from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { SideInfo } from "@genuin/components/organisms/side-info";
import {
  setQueryDataForJoinGroupInGroupDetails,
  setQueryDataForSubscribeGroupInGroupDetails,
  useGetGroupDetails,
} from "@genuin/components/react-query/api/group/details";
import { GroupDetailsTabs } from "@genuin/components/templates/group-details-tabs";
import { PostsGridSkeleton } from "@genuin/components/organisms/posts-grid";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { DetailsPageTopbar } from "@genuin/components/organisms/details-page-topbar";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";

export function GroupDetailsPage({ slug }: { slug: string }) {
  const detailsId = useId();
  const {
    data: groupDetails,
    isLoading,
    isError,
    error,
  } = useGetGroupDetails(slug);

  if (isLoading) {
    return <GroupDetailsSkeleton />;
  }

  if (isError) {
    const errorCode = (error as any)?.code;

    if (errorCode === NOT_FOUND_ERROR_CODES.group) {
      return <ErrorState type="NO_GROUP" />;
    }

    return <ErrorState type="ERROR" />;
  }

  if (!groupDetails) {
    return <ErrorState type="NO_GROUP" />;
  }

  const showPrivateGroupAccess =
    groupDetails.isPrivate && groupDetails.role !== "JOINED";

  const ldDescription = `${
    groupDetails?.description ? groupDetails.description + " | " : ""
  } • Join ${groupDetails.name} to talk about it`;

  const ctas = (
    <>
      <JoinGroupButton
        isPrivate={groupDetails.isPrivate}
        role={groupDetails.role}
        groupId={groupDetails.id}
        groupName={groupDetails.name ?? ""}
        groupDescription={ldDescription}
        shareUrl={groupDetails.shareUrl ?? ""}
        onGroupJoinStatusChange={(newRole) => {
          setQueryDataForJoinGroupInGroupDetails(slug, newRole);
        }}
      />
      <GroupSubscriptionButton
        groupId={groupDetails.id}
        isSubscriber={groupDetails.isSubscriber}
        groupName={groupDetails.name ?? ""}
        groupDescription={ldDescription}
        shareUrl={groupDetails.shareUrl ?? ""}
        showText={false}
        onSubscriptionChange={(isSubscriber) => {
          setQueryDataForSubscribeGroupInGroupDetails(slug, isSubscriber);
        }}
      />
      <ShareButton pathName={buildPageUrl({ type: "group", slug })} />
    </>
  );

  return (
    <>
      <DetailsPageTopbar
        idToTrack={detailsId}
        className="gencl:pl-4 gencl:pr-6 gencl:py-3"
        title={groupDetails.name ?? ""}
        metadata={{ type: groupDetails.isPrivate ? "PRIVATE" : "PUBLIC" }}
        ctas={
          <div className="gencl:flex gencl:gap-2 gencl:justify-end">{ctas}</div>
        }
      />

      <div className="gencl:p-6 gencl:flex gencl:h-full gencl:gap-6 gencl:flex-grow gencl:overflow-auto">
        <div className="gencl:w-full gencl:overflow-auto gencl:flex gencl:flex-col gencl:gap-6">
          <GenericDetails
            id={detailsId}
            variant="default"
            title={groupDetails.name ?? ""}
            metadata={
              <GenericDetailsMetadata
                privacyInfo={{ isPrivate: groupDetails.isPrivate }}
                stats={{
                  Members: groupDetails.noOfMembers,
                  Posts: groupDetails.noOfVideos,
                }}
              />
            }
            description={groupDetails.description ?? ""}
            ctas={<div className="gencl:flex gencl:gap-2">{ctas}</div>}
          />
          {showPrivateGroupAccess ? (
            <ComponentErrorState type="PRIVATE_GROUP" className="gencl:my-4" />
          ) : (
            <GroupDetailsTabs className="gencl:pb-6" slug={slug} />
          )}
        </div>
        <SideInfo
          className="gencl:h-fit"
          sideInfoData={{
            createdAt: convertISOToLocalDateFormate(
              groupDetails.createdAt
                ? groupDetails.createdAt
                : new Date().toISOString()
            ),
            createdBy: {
              profileImage: {
                isAvatar: groupDetails.owner.isAvatar,
                url: groupDetails.owner.profileImage,
              },
              name: groupDetails.owner.name ?? "",
              userName: groupDetails.owner.userName,
              url: buildPageUrl({
                type: !!groupDetails.owner.brand ? "brand" : "profile",
                slug: groupDetails.owner.userName,
              }),
              userLogoType: groupDetails.owner.brand?.brandUserLogo,
            },
            stats: {
              Views: groupDetails.noOfViews,
              Comments: groupDetails.noOfComments,
              Reactions: groupDetails.noOfSparks,
            },
            createdIn: {
              profileImage: {
                isAvatar: false,
                url: groupDetails.community.dp ?? "",
              },
              userName: groupDetails.community.handle,
              name: groupDetails.community.name ?? "",
              url: buildPageUrl({
                type: "community",
                slug: groupDetails.community.handle,
              }),
            },
          }}
        />
      </div>
    </>
  );
}

export function GroupDetailsSkeleton() {
  return (
    <div className="gencl:p-6 gencl:flex gencl:h-full gencl:gap-6 gencl:flex-grow gencl:overflow-auto">
      <div className="gencl:w-full gencl:overflow-auto gencl:flex gencl:flex-col gencl:gap-6">
        <GenericDetailsSkeleton
          variant="default"
          hasImage={false}
          hasLinks={false}
        />
        <TabsSkeleton />
        <PostsGridSkeleton noOfPosts={6} />
      </div>
      <div style={{ width: "100%", maxWidth: "320px" }}>
        <Skeleton className="gencl:w-full gencl:h-49" />
      </div>
    </div>
  );
}
