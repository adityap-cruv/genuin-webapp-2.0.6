import { convertISOToLocalDateFormate } from "@genuin/ui/utils";

import { GroupSubscriptionButton } from "src/molecules/group-subscription-button";
import { JoinGroupButton } from "src/molecules/join-group-button";
import { ShareButton } from "src/molecules/share-button";
import { GenericDetails } from "src/organisms";
import { GenericDetailsMetadata } from "src/organisms/generic-details/generic-details-metadata";
import { SideInfo } from "src/organisms/side-info";
import { useGetGroupDetails } from "src/react-query/api/group/details";
import { GroupDetailsTabs } from "src/templates/group-details-tabs";

export function GroupDetailsPage({ slug }: { slug: string }) {
  const { data: groupDetails, isLoading, isError } = useGetGroupDetails(slug);

  // TODO: Handle loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !groupDetails) {
    return <div>Error loading group details.</div>;
  }

  return (
    <div className="gencl:p-6 gencl:flex gencl:h-full gencl:gap-6 gencl:flex-grow gencl:overflow-auto">
      <div className="gencl:w-full gencl:overflow-auto gencl:flex gencl:flex-col gencl:gap-6">
        <GenericDetails
          variant="default"
          title={groupDetails.name ?? ""}
          metadata={
            <GenericDetailsMetadata
              privacyInfo={{ isPrivate: groupDetails.isPrivate }}
              stats={{
                members: groupDetails.noOfMembers,
                posts: groupDetails.noOfVideos,
              }}
            />
          }
          description={groupDetails.description ?? ""}
          ctas={
            <div className="gencl:flex gencl:gap-2">
              <JoinGroupButton />
              <GroupSubscriptionButton showText />
              <ShareButton showText />
            </div>
          }
        />
        <GroupDetailsTabs
          className="gencl:flex-grow gencl:min-h-0 gencl:overflow-y-auto gencl:pb-6"
          slug={slug}
        />
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
            url: `/@${groupDetails.owner.userName}`,
          },
          stats: {
            Views: groupDetails.noOfViews,
            Comments: groupDetails.noOfComments,
            Sparks: groupDetails.noOfSparks,
          },
          createdIn: {
            profileImage: {
              isAvatar: false,
              url: groupDetails.community.dp ?? "",
            },
            userName: groupDetails.community.handle,
            name: groupDetails.community.name ?? "",
            url: `/community/${groupDetails.community.slug}`,
          },
        }}
      />
    </div>
  );
}
