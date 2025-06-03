import { Image } from "@genuin/ui/image";
import { Loader } from "@genuin/ui/loader";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { JoinCommunityButton } from "src/molecules/join-community-button";
import { ShareButton } from "src/molecules/share-button";
import { GenericDetails } from "src/organisms";
import { GenericDetailsMetadata } from "src/organisms/generic-details/generic-details-metadata";
import { MemberList } from "src/organisms/member-list";
import { SideInfo } from "src/organisms/side-info";
import { useGetCommunityDetails } from "src/react-query/api/community/details/details";
import { CommunityDetailsTabs } from "src/templates/community-details-tabs";

export function CommunityDetails({ slug }: { slug: string }) {
  const {
    data: communityDetails,
    isLoading,
    isError,
  } = useGetCommunityDetails(slug);

  // TODO: Handle if community doesn't exist.

  // TODO: Add loading state for the communit  details
  if (isLoading) {
    return <Loader size="md" />;
  }

  // TODO: Hnadle error statse for this.
  if (isError || !communityDetails) {
    return <div>Handle error state for the community</div>;
  }

  const admins = (
    <MemberList
      className="gencl:border-t gencl:pt-4 gencl:border-secondary-200"
      title="Admins"
      members={[
        {
          bio: communityDetails.leader.bio ?? "",
          isOwner: true,
          memberId: communityDetails.leader.member_id,
          profileImage: {
            isAvatar: communityDetails.leader.is_avatar,
            url: communityDetails.leader.profile_image ?? "",
          },
          name: communityDetails.leader.name ?? "",
          url: `/test/${communityDetails.leader.member_id}`,
          userName: communityDetails.leader.nickname,
          brand: {
            userLogoType: communityDetails.leader.brand?.brand_user_logo,
          },
        },
        ...communityDetails.moderators.map((moderator) => ({
          bio: moderator.bio ?? "",
          isOwner: moderator.member_id === communityDetails.leader.member_id,
          memberId: moderator.member_id,
          profileImage: {
            isAvatar: moderator.is_avatar,
            url: moderator.profile_image_m ?? moderator.profile_image ?? "",
          },
          name: moderator.name ?? "",
          url: `/test/${moderator.member_id}`,
          userName: moderator.nickname,
        })),
      ]}
    />
  );

  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col gencl:h-full gencl:px-6">
      <CommunityBanner
        src={communityDetails?.banner ?? ""}
        className="gencl:shrink-0"
      />
      <div className="gencl:pt-6 gencl:h-full gencl:gap-6 gencl:overflow-auto gencl:flex-grow gencl:flex gencl:items-start">
        <div className="gencl:w-full gencl:h-full gencl:overflow-auto">
          <GenericDetails
            title={communityDetails?.name ?? ""}
            profileImageDetails={{
              imageUrl: communityDetails?.dp_m ?? communityDetails.dp ?? "",
              isAvatar: false,
              alt: communityDetails?.name ?? "",
            }}
            description={communityDetails.description ?? ""}
            metadata={
              <GenericDetailsMetadata
                handle={{
                  userName: communityDetails.handle ?? "",
                  url: `/community/${slug}`,
                }}
                privacyInfo={{ isPrivate: communityDetails.type === "PRIVATE" }}
                stats={{
                  Members: communityDetails.no_of_members,
                  Groups: communityDetails.no_of_loops,
                  Posts: communityDetails.no_of_videos,
                }}
              />
            }
            links={{
              custom: communityDetails.social_links.social_web_url ?? undefined,
              x: communityDetails.social_links.twitter?.url ?? undefined,
              instagram: communityDetails.social_links.insta?.url ?? undefined,
            }}
            ctas={
              <div className="gencl:flex gencl:gap-2">
                <JoinCommunityButton />
                <ShareButton showText />
              </div>
            }
          />
          <CommunityDetailsTabs slug={slug} className="gencl:pt-6" />
        </div>
        <SideInfo
          className="gencl:h-fit"
          sideInfoData={{
            createdAt: communityDetails.created_at ?? new Date().toISOString(),
            createdBy: {
              profileImage: {
                url: communityDetails.leader.profile_image ?? "",
                isAvatar: communityDetails.leader.is_avatar,
              },
              // TODO: add path  name
              url: `/test`,
              userName: communityDetails.leader.nickname ?? "",
              name: communityDetails.leader.name ?? "",
              userLogoType: communityDetails.brand?.brand_user_logo,
            },
            createdIn: {
              profileImage: {
                url: communityDetails.brand?.logo ?? "",
                isAvatar: false,
              },
              url: `/test`,
              name: communityDetails.brand?.name ?? "",
              userName: communityDetails.brand?.brand_slug ?? "",
              userLogoType: communityDetails.brand?.brand_user_logo,
            },
            stats: {
              Views: communityDetails.no_of_views ?? 0,
              Comments: communityDetails.no_of_comments ?? 0,
              Sparks: communityDetails.no_of_sparks ?? 0,
            },
            guidelines: communityDetails.guidelines.map(
              (guideline) => guideline.title
            ),
          }}
          others={admins}
        />
      </div>
    </div>
  );
}

function CommunityBanner({
  src,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  alt,
  className,
  ...restProps
}: ComponentProps<typeof Image>) {
  return (
    <Image
      src={src}
      alt={undefined}
      className={cn(
        "gencl:w-full gencl:h-40 gencl:bg-secondary-300 gencl:rounded-lg",
        className
      )}
      {...restProps}
    />
  );
}
