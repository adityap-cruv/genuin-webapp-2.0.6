"use client";
import {
  useId,
  useCallback,
  useEffect,
  ReactNode,
  ComponentProps,
} from "react";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { MemberList } from "@genuin/components/organisms/member-list";
import { SideInfo } from "@genuin/components/organisms/side-info";
import { DetailsPageTopbar } from "@genuin/components/organisms/details-page-topbar";
import {
  useGetCommunityDetails,
  setQueryDataForCommunityRoleChange,
} from "@genuin/components/react-query/api/community/details/details";
import { CommunityDetailsTabs } from "@genuin/components/templates/community-details-tabs";
import { CommunityDetailsSkeleton } from "./skeleton";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { CommunityUserRole } from "@genuin/components/types/post";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { useLocalStorage } from "usehooks-ts";
import { RECENT_COMMUNITIES_KEY } from "@genuin/components/lib/constants";
import { type RecentCommunity } from "@genuin/components/types/community";
import { CommunityFeedView } from "./feed-view";
import { Avatar } from "@genuin/ui/components/avatar";
import { CommunityBanner } from "@genuin/components/molecules/comunity-banner";
import { mapMemberDetails } from "./utils";
import { getSocialLinks } from "@genuin/components/lib/utils";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

export function CommunityDetails({
  slug,
  isFeed = false,
}: {
  slug: string;
  isFeed?: boolean;
}) {
  // If isFeed is true, render the community feed
  if (isFeed) {
    return <CommunityFeedView communitySlug={slug} />;
  }

  // Otherwise, render the full community details view
  return <CommunityDetailsView slug={slug} />;
}

// TODO: Move this to a utility file
function updateRecentCommunities(
  newCommunity: RecentCommunity,
  prevCommunities: RecentCommunity[] = []
): RecentCommunity[] {
  // Check if community already exists
  const exists = prevCommunities.some((c) => c.slug === newCommunity.slug);
  if (exists) {
    // Move existing community to the start
    return [
      newCommunity,
      ...prevCommunities.filter((c) => c.slug !== newCommunity.slug),
    ];
  }
  // Add new community to the start, keep max 10 recent
  return [newCommunity, ...prevCommunities].slice(0, 10);
}

function CommunityDetailsView({ slug }: { slug: string }) {
  const {
    data: communityDetails,
    isLoading,
    isError,
    error,
  } = useGetCommunityDetails(slug);
  const { isDesktop } = useDeviceDetectMediaQuery();
  const detailsId = useId();
  const [storedCommunities, setStoredCommunities] = useLocalStorage<
    RecentCommunity[]
  >(RECENT_COMMUNITIES_KEY, []);

  const handleCommunityJoinStatusChange = useCallback(
    (newRole: CommunityUserRole) => {
      setQueryDataForCommunityRoleChange(slug, newRole);
    },
    [slug]
  );

  useEffect(() => {
    if (!communityDetails) return;

    const newCommunity: RecentCommunity = {
      dp: communityDetails.dp ?? communityDetails.dp_s ?? "",
      community_name: communityDetails.name ?? "",
      slug: communityDetails.slug,
    };

    setStoredCommunities((prev) => updateRecentCommunities(newCommunity, prev));
  }, [communityDetails, setStoredCommunities]);

  if (isLoading) {
    return <CommunityDetailsSkeleton />;
  }

  if (isError) {
    if (error.message === NOT_FOUND_ERROR_CODES.community) {
      return <ErrorState type="NO_COMMUNITY" />;
    }

    return <ErrorState type="ERROR" />;
  }

  if (!communityDetails) {
    return <ErrorState type="NO_COMMUNITY" />;
  }

  const showPrivateCommunityAccess =
    communityDetails.type === "PRIVATE" &&
    (communityDetails.logged_in_user_role === "UNJOINED" ||
      communityDetails.logged_in_user_role === "REQUESTED");

  const admins = (
    <MemberList
      title="Admins"
      members={[
        mapMemberDetails(
          communityDetails.leader,
          communityDetails.leader.member_id
        ),
        ...communityDetails.moderators.map((moderator) =>
          mapMemberDetails(moderator, communityDetails.leader.member_id)
        ),
      ]}
    />
  );

  const createCtas = ({ inTopBar = false }: { inTopBar?: boolean }) => (
    <div className="gencl:flex gencl:gap-2">
      <JoinCommunityButton
        roleTexts={{
          UNJOINED: inTopBar ? "Join" : "Join Community",
        }}
        role={communityDetails.logged_in_user_role}
        communityId={communityDetails.community_id}
        communityHandle={communityDetails.handle}
        communityName={communityDetails.name ?? ""}
        slug={communityDetails.slug}
        isPrivate={communityDetails.type === "PRIVATE"}
        onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
        className="gencl:flex-grow gencl:sm:flex-grow-0!"
      />
      {!inTopBar && (
        <ShareButton pathName={buildPageUrl({ type: "community", slug })} />
      )}
    </div>
  );

  return (
    <>
      {/* Sticky Topbar */}
      <DetailsPageTopbar
        idToTrack={detailsId}
        className="gencl:pl-4 gencl:pr-6 gencl:py-4"
        title={communityDetails?.name ?? ""}
        profileImageDetails={{
          imageUrl: communityDetails?.dp_m ?? communityDetails.dp ?? "",
          isAvatar: false,
          alt: communityDetails?.name ?? "",
        }}
        metadata={{ type: communityDetails.type }}
        ctas={
          <div className="gencl:gap-2 gencl:justify-end gencl:flex">
            {createCtas({ inTopBar: true })}
          </div>
        }
      />
      <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:px-0 gencl:sm:px-6">
        <div className="gencl:h-auto gencl:relative">
          <CommunityBanner
            src={communityDetails?.banner ?? ""}
            className="gencl:shrink-0"
          />
          <Avatar
            alt={communityDetails?.name ?? ""}
            imageUrl={communityDetails?.dp_m ?? communityDetails.dp ?? ""}
            size="xl"
            isAvatar={false}
            className="gencl:absolute gencl:bottom-0 gencl:translate-y-1/2 gencl:left-4 gencl:sm:hidden! gencl:block gencl:border gencl:border-white"
          />
        </div>
        <div className="gencl:flex gencl:pt-10 gencl:sm:pt-6! gencl:gap-6">
          <div className="gencl:w-full">
            <Details
              communityDetails={communityDetails}
              detailsId={detailsId}
              ctas={createCtas({})}
            />
            {showPrivateCommunityAccess ? (
              <ComponentErrorState
                type="PRIVATE_COMMUNITY"
                className="gencl:my-4"
              />
            ) : (
              <CommunityDetailsTabs
                slug={slug}
                className="gencl:pt-3 gencl:sm:pt-6"
                communityOwnerId={communityDetails.leader.member_id}
                aboutComponent={
                  <About
                    communityDetails={communityDetails}
                    admins={admins}
                    variant="mobile"
                  />
                }
                ownerInfo={{
                  userName: communityDetails.leader.nickname,
                }}
              />
            )}
          </div>
          {isDesktop && (
            <About
              communityDetails={communityDetails}
              admins={admins}
              variant="default"
            />
          )}
        </div>
      </div>
    </>
  );
}

function About({
  communityDetails,
  admins,
  variant,
}: {
  communityDetails: ReturnType<typeof useGetCommunityDetails>["data"];
  admins: ReactNode;
  variant: ComponentProps<typeof SideInfo>["variant"];
}) {
  if (!communityDetails) return null;

  return (
    <SideInfo
      variant={variant ?? "default"}
      sideInfoData={{
        createdAt: communityDetails.created_at ?? new Date().toISOString(),
        description: communityDetails.description ?? "",
        links: getSocialLinks(communityDetails.social_links),
        createdBy: {
          profileImage: {
            url: communityDetails.leader.profile_image ?? "",
            isAvatar: communityDetails.leader.is_avatar,
          },
          url: buildPageUrl({
            type: !!communityDetails.leader.brand ? "brand" : "profile",
            slug: !!communityDetails.leader.brand
              ? communityDetails.leader.brand.brand_slug
              : communityDetails.leader.nickname,
          }),
          userName: communityDetails.leader.nickname ?? "",
          name: communityDetails.leader.name ?? "",
          userLogoType: communityDetails.brand?.brand_user_logo,
        },
        createdIn: {
          profileImage: {
            url: communityDetails.brand?.logo ?? "",
            isAvatar: false,
          },
          url: buildPageUrl({
            type: "brand",
            slug: communityDetails.brand?.brand_slug ?? "",
          }),
          name: communityDetails.brand?.name ?? "",
          userName: communityDetails.brand?.brand_handle ?? "",
          userLogoType: communityDetails.brand?.brand_user_logo,
        },
        stats: {
          Views: communityDetails.no_of_views ?? 0,
          Comments: communityDetails.no_of_comments ?? 0,
          Reactions: communityDetails.no_of_reactions ?? 0,
        },
        guidelines: communityDetails.guidelines,
      }}
      others={admins}
    />
  );
}

function Details({
  communityDetails,
  detailsId,
  ctas,
}: {
  communityDetails: ReturnType<typeof useGetCommunityDetails>["data"];
  detailsId: string;
  ctas: ReactNode;
}) {
  if (!communityDetails) return;

  const metadata = (
    <GenericDetailsMetadata
      handle={{
        userName: communityDetails.handle ?? "",
        url: buildPageUrl({
          type: "community",
          slug: communityDetails.slug,
        }),
      }}
      privacyInfo={{
        isPrivate: communityDetails.type === "PRIVATE",
      }}
      stats={{
        Members: communityDetails.no_of_members,
        Groups: communityDetails.no_of_loops,
        Posts: communityDetails.no_of_videos,
      }}
      separatorConfig={{
        afterHandle: false,
      }}
    />
  );

  return (
    <GenericDetails
      className="gencl:px-4"
      variant="community"
      id={detailsId}
      title={communityDetails?.name ?? ""}
      profileImageDetails={{
        imageUrl: communityDetails?.dp_m ?? communityDetails.dp ?? "",
        isAvatar: false,
        alt: communityDetails?.name ?? "",
      }}
      description={communityDetails.description ?? ""}
      metadata={metadata}
      links={getSocialLinks(communityDetails.social_links)}
      ctas={ctas}
    />
  );
}
