import { Skeleton } from "@genuin/ui/skeleton";
import { TabsSkeleton } from "@genuin/ui/tabs";
import { convertISOToLocalDateFormate } from "@genuin/ui/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { GroupSubscriptionButton } from "@molecules/group-subscription-button";
import { JoinGroupButton } from "@molecules/join-group-button";
import { ShareButton } from "@molecules/share-button";
import {
  GenericDetails,
  GenericDetailsSkeleton,
} from "@organisms/generic-details";
import { GenericDetailsMetadata } from "@organisms/generic-details/generic-details-metadata";
import { SideInfo } from "@organisms/side-info";
import { useGetGroupDetails } from "@react-query/api/group/details";
import { GroupDetailsTabs } from "@templates/group-details-tabs";
import { PostsGridSkeleton } from "@organisms/posts-grid";

export function GroupDetailsPage({ slug }: { slug: string }) {
  const { data: groupDetails, isLoading, isError } = useGetGroupDetails(slug);

  if (isLoading) {
    return <GroupDetailsSkeleton />;
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
                Members: groupDetails.noOfMembers,
                Posts: groupDetails.noOfVideos,
              }}
            />
          }
          description={groupDetails.description ?? ""}
          ctas={
            <div className="gencl:flex gencl:gap-2">
              <JoinGroupButton />
              <GroupSubscriptionButton showText />
              <ShareButton />
            </div>
          }
        />
        <GroupDetailsTabs className="gencl:pb-6" slug={slug} />
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
            Sparks: groupDetails.noOfSparks,
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
