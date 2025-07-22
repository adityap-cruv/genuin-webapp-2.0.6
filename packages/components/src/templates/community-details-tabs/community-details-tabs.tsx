"use client";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";
import React, { useEffect, useState } from "react";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { MemberList } from "@genuin/components/organisms/member-list";
import { GroupCardSkeleton } from "@genuin/components/organisms/group-card";
import { PostsGridSkeleton } from "@genuin/components/organisms/posts-grid";
import {
  setQueryDataForJoinGroupStatusInCommunityGroups,
  setQueryDataForSubscriptionStatusInCommunityGroups,
  useGetCommunityGroups,
} from "@genuin/components/react-query/api/community/groups";
import { useGetCommunityMembers } from "@genuin/components/react-query/api/community/members";
import type { MembersSchemaType } from "@genuin/components/react-query/api/community/members/schema";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { GroupPosts } from "@genuin/components/organisms/group-posts";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

type CommunityDetailsTabsPropsType = Omit<
  {
    slug: string;
    /**
     * About component to be rendered in the about tab.
     */
    aboutComponent: React.ReactNode;
    /**
     * ID of the community owner.
     */
    communityOwnerId: string;
    ownerInfo: {
      userName: string;
    };
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function CommunityDetailsTabs({
  slug,
  className,
  communityOwnerId,
  aboutComponent,
  ownerInfo,
  ...restProps
}: CommunityDetailsTabsPropsType) {
  const { isDesktop } = useDeviceDetectMediaQuery();
  const contentClassName = "gencl:px-4 gencl:sm:px-0!";

  // Track the current tab value
  const [tabValue, setTabValue] = useState<string>("groups");

  // Sync tab value when isDesktop changes
  useEffect(() => {
    if (isDesktop && tabValue === "about") {
      setTabValue("groups");
    } else if (!isDesktop && tabValue === "posts") {
      // Optionally, keep the current tab or switch to 'about' if you want
      // setTabValue("about");
    }
  }, [isDesktop, tabValue]);

  return (
    <Tabs
      value={tabValue}
      onValueChange={setTabValue}
      className={cn("gencl:w-full gencl:h-full", className)}
      {...restProps}
    >
      <TabsList className="groups">
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        {!isDesktop && <TabsTrigger value="about">About</TabsTrigger>}
      </TabsList>
      <TabsContent value="groups" className={contentClassName}>
        <CommunityGroups slug={slug} ownerInfo={ownerInfo} />
      </TabsContent>
      <TabsContent value="members" className={contentClassName}>
        <CommunityMembers slug={slug} communityOwnerId={communityOwnerId} />
      </TabsContent>
      <TabsContent value="about" className={contentClassName}>
        {aboutComponent}
      </TabsContent>
    </Tabs>
  );
}

// TODO: USE <GroupCard/> component here.
function CommunityGroups({
  slug,
  ownerInfo,
}: {
  slug: string;
  ownerInfo: {
    userName: string;
  };
}) {
  const {
    data: communityGroups,
    isLoading,
    isError,
  } = useGetCommunityGroups(slug);

  if (isLoading) {
    return <CommunityGroupsSkeleton />;
  }

  if (isError) {
    return <ComponentErrorState type="WARNING" />;
  }

  if (!communityGroups || communityGroups.groups.length === 0) {
    return <ComponentErrorState type="NO_GROUPS" />;
  }

  const groups = communityGroups.groups;

  return groups.map((group) => {
    const showPrivateGroupAccess =
      !group.is_view_allowed && group.logged_in_user_status !== "JOINED";

    return (
      <GenericDetails
        variant="list"
        key={group.slug}
        className="gencl:mb-4 gencl:overflow-clip"
        title={group.group.group_name ?? ""}
        url={buildPageUrl({
          type: "group",
          slug: group.slug,
        })}
        ownerInfo={ownerInfo}
        showPinned={typeof group.position === "number"}
        metadata={
          <GenericDetailsMetadata
            className="gencl:pt-2"
            privacyInfo={{ isPrivate: !group.is_view_allowed }}
            stats={{
              Members: group.group.no_of_members,
              Posts: group.group.no_of_videos,
              Views: group.group.no_of_views,
            }}
          />
        }
        ctas={
          <div className="gencl:sm:flex! gencl:hidden gencl:gap-2">
            <JoinGroupButton
              size="sm"
              buttonTexts={{ UNJOINED: "Join" }}
              groupId={group.chat_id}
              groupName={group.group.group_name ?? ""}
              groupDescription={`${
                group.group.group_description
                  ? group.group.group_description + " | "
                  : ""
              } • Join ${group.group.group_name} to talk about it`}
              shareUrl={group.share_url ?? ""}
              isPrivate={group.is_view_allowed}
              role={group.logged_in_user_status}
              onGroupJoinStatusChange={(newRole) => {
                // Handle group join status change if needed
                setQueryDataForJoinGroupStatusInCommunityGroups(
                  group.chat_id,
                  slug,
                  newRole
                );
              }}
            />
            <GroupSubscriptionButton
              size="sm"
              groupId={group.chat_id}
              groupName={group.group.group_name ?? ""}
              groupDescription={`${
                group.group.group_description
                  ? group.group.group_description + " | "
                  : ""
              } • Join ${group.group.group_name} to talk about it`}
              shareUrl={group.share_url ?? ""}
              isSubscriber={group.is_subscriber ?? false}
              showText={false}
              onSubscriptionChange={(isSubscribed) => {
                setQueryDataForSubscriptionStatusInCommunityGroups(
                  group.chat_id,
                  slug,
                  isSubscribed
                );
              }}
            />
            <ShareButton
              size="sm"
              showText={false}
              pathName={buildPageUrl({ type: "group", slug: group.slug })}
            />
          </div>
        }
      >
        {showPrivateGroupAccess ? (
          <ComponentErrorState forList type="PRIVATE_GROUP" />
        ) : (
          <GroupPosts
            slug={group.slug}
            className="gencl:bg-secondary-50 gencl:p-4"
            lazyLoad="manual"
            enableFeedView
          />
        )}
      </GenericDetails>
    );
  });
}

function CommunityMembers({
  slug,
  communityOwnerId,
}: {
  slug: string;
  communityOwnerId: string;
}) {
  const {
    data: communityMembers,
    isError,
    isLoading,
  } = useGetCommunityMembers(slug);

  // If the API returns { members: [...] }, extract the array
  const membersData =
    communityMembers && "members" in communityMembers
      ? communityMembers.members
      : (communityMembers as MembersSchemaType | undefined);

  // Helper function to transform member data
  const transformMember = (member: MembersSchemaType[number]) => ({
    isOwner: member.member_id === communityOwnerId,
    bio: member.bio ?? "",
    memberId: member.member_id,
    name: member.name ?? "",
    profileImage: {
      isAvatar: member.is_avatar,
      url: member.profile_image,
    },
    url: buildPageUrl({
      type: !!member.brand ? "brand" : "profile",
      slug: !!member.brand ? member.brand.brand_slug : member.nickname,
    }),
    userName: member.nickname,
    brand: {
      brandUserLogo: member.brand?.brand_user_logo ?? -1,
      brandId: member.brand?.brand_id ?? 0,
      brandSlug: member.brand?.brand_slug ?? "",
    },
  });

  // Filter admins (role 1: leader, role 3: moderator)
  const admins =
    membersData?.filter((member) => member.role === 1 || member.role === 3) ??
    [];

  // Filter members (role 2: member)
  const members = membersData?.filter((member) => member.role === 2) ?? [];

  return (
    <div>
      <div>
        <p className="gencl:text-body-1-semi-bold gencl:mb-3">Admins</p>
        <MemberList
          isError={isError}
          isLoading={isLoading}
          members={admins.map(transformMember)}
        />
      </div>
      <hr className="gencl:my-6 gencl:mt-2 gencl:border-secondary-150" />
      <div>
        <p className="gencl:text-body-1-semi-bold gencl:mb-3">Members</p>
        <MemberList
          isError={isError}
          isLoading={isLoading}
          members={members.map(transformMember)}
        />
      </div>
    </div>
  );
}

export function CommunityGroupsSkeleton() {
  return (
    <div className="gencl:gap-4 gencl:border-secondary-150 gencl:border gencl:rounded-xl gencl:mb-4 gencl:overflow-clip">
      <GroupCardSkeleton className="gencl:p-4" />
      <PostsGridSkeleton className="gencl:p-4" noOfPosts={6} />
    </div>
  );
}
