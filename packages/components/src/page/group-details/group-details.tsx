import { group } from "console";
import { TOP_BAR_HEIGHT } from "src/lib/constants";
import { JoinGroupButton } from "src/molecules/join-group-button";
import { ShareButton } from "src/molecules/share-button";
import { GenericDetails } from "src/organisms";
import { GenericDetailsMetadata } from "src/organisms/generic-details/generic-details-metadata";
import { SideBar } from "src/organisms/side-bar";
import { SideInfo } from "src/organisms/side-info";
import { TopBar } from "src/organisms/top-bar";
import { useGetGroupDetails } from "src/react-query/api/group/details";
import { useWindowSize } from "usehooks-ts";

export function GroupDetailsPage({ slug }: { slug: string }) {
  const { height } = useWindowSize();
  const { data: groupDetails, isLoading, isError } = useGetGroupDetails(slug);

  // TODO: Handle loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !groupDetails) {
    return <div>Error loading group details.</div>;
  }

  return (
    <div
      className="gencl:h-full gencl:w-full gencl:mx-auto"
      style={{ maxWidth: 1440 }}
    >
      <TopBar className="gencl:border-b gencl:border-secondary-150" />
      <main className="gencl:flex gencl:h-full">
        <SideBar style={{ height: height - TOP_BAR_HEIGHT }} />
        <div className="gencl:p-6 gencl:flex gencl:gap-9 gencl:w-full gencl:items-start">
          <div className="gencl:w-full">
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
                  <ShareButton />
                </div>
              }
            />
          </div>
          <SideInfo
            className="gencl:shrink-0"
            sideInfoData={{
              createdAt: "17th October 2023",
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
                Comments: 0,
                Sparks: 0,
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
      </main>
    </div>
  );
}
