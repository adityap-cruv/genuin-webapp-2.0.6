"use client";
import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/utils";
import {
  useId,
  useCallback,
  type ComponentProps,
  useEffect,
  useMemo,
} from "react";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { FeedView } from "@genuin/components/templates/feed";
import { useGetCommunityFeed } from "@genuin/components/react-query/api/community/feed";
import { getQueryKeyForCommunityFeed } from "@genuin/components/react-query/keys/community";

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
          url: buildPageUrl({
            type: !!communityDetails.leader.brand ? "brand" : "profile",
            slug: communityDetails.leader.nickname,
          }),
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
          url: buildPageUrl({
            type: !!moderator.brand ? "brand" : "profile",
            slug: moderator.nickname,
          }),
          userName: moderator.nickname,
        })),
      ]}
    />
  );

  const ctas = (
    <>
      <JoinCommunityButton
        role={communityDetails.logged_in_user_role}
        communityId={communityDetails.community_id}
        communityHandle={communityDetails.handle}
        communityName={communityDetails.name ?? ""}
        slug={communityDetails.slug}
        isPrivate={communityDetails.type === "PRIVATE"}
        onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
      />
      <ShareButton pathName={buildPageUrl({ type: "community", slug })} />
    </>
  );

  return (
    <>
      {/* Sticky Topbar */}
      <DetailsPageTopbar
        idToTrack={detailsId}
        className="gencl:pl-4 gencl:pr-6 gencl:py-3"
        title={communityDetails?.name ?? ""}
        profileImageDetails={{
          imageUrl: communityDetails?.dp_m ?? communityDetails.dp ?? "",
          isAvatar: false,
          alt: communityDetails?.name ?? "",
        }}
        metadata={{ type: communityDetails.type }}
        ctas={
          <div className="gencl:flex gencl:gap-2 gencl:justify-end">{ctas}</div>
        }
      />
      <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:px-6">
        <CommunityBanner
          src={communityDetails?.banner ?? ""}
          className="gencl:shrink-0"
        />
        <div className="gencl:flex gencl:pt-6 gencl:gap-6">
          <div className="gencl:w-full">
            <GenericDetails
              id={detailsId}
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
                  privacyInfo={{
                    isPrivate: communityDetails.type === "PRIVATE",
                  }}
                  stats={{
                    Members: communityDetails.no_of_members,
                    Groups: communityDetails.no_of_loops,
                    Posts: communityDetails.no_of_videos,
                  }}
                />
              }
              links={{
                custom:
                  communityDetails.social_links.social_web_url ?? undefined,
                x: communityDetails.social_links.twitter?.url ?? undefined,
                instagram:
                  communityDetails.social_links.insta?.url ?? undefined,
              }}
              ctas={<div className="gencl:flex gencl:gap-2">{ctas}</div>}
            />
            {showPrivateCommunityAccess ? (
              <ComponentErrorState
                type="PRIVATE_COMMUNITY"
                className="gencl:my-4"
              />
            ) : (
              <CommunityDetailsTabs slug={slug} className="gencl:pt-6" />
            )}
          </div>
          <SideInfo
            className="gencl:h-fit gencl:sticky gencl:top-2 gencl:shrink-0 gencl:pb-6 gencl:max-h-full gencl:overflow-auto"
            sideInfoData={{
              createdAt:
                communityDetails.created_at ?? new Date().toISOString(),
              createdBy: {
                profileImage: {
                  url: communityDetails.leader.profile_image ?? "",
                  isAvatar: communityDetails.leader.is_avatar,
                },
                url: buildPageUrl({
                  type: !!communityDetails.leader.brand ? "brand" : "profile",
                  slug: communityDetails.leader.nickname,
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
                userName: communityDetails.brand?.brand_slug ?? "",
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
        </div>
      </div>
    </>
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

function CommunityFeedView({ communitySlug }: { communitySlug: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetCommunityFeed(communitySlug, "");

  const feed = useMemo(
    () => data?.pages.flatMap((page) => page.feed) ?? [],
    [data]
  );

  return (
    <FeedView
      startIndex={0}
      feedData={{
        videos: feed,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        queryKey: getQueryKeyForCommunityFeed(communitySlug, ""),
      }}
    />
  );
}
