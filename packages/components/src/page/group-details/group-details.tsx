"use client";
import { ComponentProps, useId } from "react";
import { convertISOToLocalDateFormate } from "@genuin/ui/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { SideInfo } from "@genuin/components/organisms/side-info";
import {
  GroupDetailsType,
  setQueryDataForJoinGroupInGroupDetails,
  setQueryDataForSubscribeGroupInGroupDetails,
  useGetGroupDetails,
} from "@genuin/components/react-query/api/group/details";
import { GroupDetailsTabs } from "@genuin/components/templates/group-details-tabs";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { DetailsPageTopbar } from "@genuin/components/organisms/details-page-topbar";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { GroupDetailsSkeleton } from "./skeleton";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

export function GroupDetailsPage({ slug }: { slug: string }) {
  const { isDesktop } = useDeviceDetectMediaQuery();
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
    if (error.message === NOT_FOUND_ERROR_CODES.group) {
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

  const createCtas = ({ inTopBar = false }: { inTopBar?: boolean }) => (
    <>
      <JoinGroupButton
        buttonTexts={{ UNJOINED: inTopBar ? "Join" : "Join Group" }}
        isPrivate={groupDetails.isPrivate}
        className="gencl:flex-grow gencl:sm:flex-grow-0!"
        role={groupDetails.role}
        groupId={groupDetails.id}
        groupName={groupDetails.name ?? ""}
        groupDescription={ldDescription}
        shareUrl={groupDetails.shareUrl ?? ""}
        onGroupJoinStatusChange={(newRole) => {
          setQueryDataForJoinGroupInGroupDetails(slug, newRole);
        }}
      />
      {groupDetails.role !== "REQUESTED" && (
        <GroupSubscriptionButton
          className="gencl:flex-grow gencl:sm:flex-grow-0!"
          groupId={groupDetails.id}
          isSubscriber={groupDetails.isSubscriber}
          groupName={groupDetails.name ?? ""}
          groupDescription={ldDescription}
          shareUrl={groupDetails.shareUrl ?? ""}
          showText={!inTopBar}
          onSubscriptionChange={(isSubscriber) => {
            setQueryDataForSubscribeGroupInGroupDetails(slug, isSubscriber);
          }}
        />
      )}
      {!inTopBar && (
        <ShareButton pathName={buildPageUrl({ type: "group", slug })} />
      )}
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
          <div className="gencl:flex gencl:gap-2 gencl:justify-end">
            {createCtas({ inTopBar: true })}
          </div>
        }
      />
      <div className="gencl:sm:p-6! gencl:p-0 gencl:flex gencl:h-full gencl:gap-6 gencl:flex-grow gencl:overflow-auto">
        <div className="gencl:w-full gencl:overflow-auto gencl:flex gencl:flex-col gencl:gap-0 gencl:sm:gap-6!">
          <GenericDetails
            id={detailsId}
            className="gencl:p-4 gencl:pb-0 gencl:sm:p-0!"
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
            ctas={
              <div className="gencl:gap-2 gencl:flex gencl:items-center">
                {createCtas({})}
              </div>
            }
          />
          {showPrivateGroupAccess ? (
            <ComponentErrorState type="PRIVATE_GROUP" className="gencl:my-4" />
          ) : (
            <GroupDetailsTabs
              className="gencl:pb-6"
              slug={slug}
              aboutComponent={
                <About groupDetails={groupDetails} variant="mobile" />
              }
              ownerId={groupDetails.owner.id}
            />
          )}
        </div>
        {isDesktop && <About groupDetails={groupDetails} variant="default" />}
      </div>
    </>
  );
}

function About({
  groupDetails,
  variant,
}: {
  groupDetails: GroupDetailsType;
  variant: ComponentProps<typeof SideInfo>["variant"];
}) {
  return (
    <SideInfo
      className="gencl:h-fit"
      variant={variant}
      sideInfoData={{
        createdAt: convertISOToLocalDateFormate(
          groupDetails.createdAt
            ? groupDetails.createdAt
            : new Date().toISOString()
        ),
        description: groupDetails.description ?? "",
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
            slug: groupDetails.community.slug,
          }),
        },
      }}
    />
  );
}
