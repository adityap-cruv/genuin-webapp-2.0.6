import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";

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
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { GroupPosts } from "@genuin/components/organisms/group-posts";

type CommunityDetailsTabsPropsType = Omit<
  {
    slug: string;
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
  ownerInfo,
  ...restProps
}: CommunityDetailsTabsPropsType) {
  return (
    <Tabs
      defaultValue="groups"
      className={cn("gencl:w-full gencl:h-full", className)}
      {...restProps}
    >
      <TabsList className="">
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="groups">
        <CommunityGroups slug={slug} ownerInfo={ownerInfo} />
      </TabsContent>
      <TabsContent value="members">
        <CommunityMembers communityOwnerId={communityOwnerId} slug={slug} />
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
  console.log("groups", groups);

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
            privacyInfo={{ isPrivate: !group.is_view_allowed }}
            stats={{
              Members: group.group.no_of_members,
              Posts: group.group.no_of_videos,
              Views: group.group.no_of_views,
            }}
          />
        }
        ctas={
          <div className="gencl:flex gencl:gap-2">
            <JoinGroupButton
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

  return (
    <MemberList
      className="gencl:max-w-sm"
      isError={isError}
      isLoading={isLoading}
      members={communityMembers?.members.map((member) => ({
        isOwner: member.member_id === communityOwnerId,
        bio: member.bio ?? "",
        memberId: member.member_id,
        name: member.name ?? "",
        profileImage: {
          isAvatar: member.is_avatar,
          url: member.profile_image,
        },
        url: `/test/${member.member_id}`,
        userName: member.nickname,
        brand: {
          userLogoType: member.brand?.brand_user_logo,
        },
      }))}
    />
  );
}

export function CommunityGroupsSkeleton() {
  return (
    <div className="gencl:gap-4 gencl:border-secondary-200 gencl:border gencl:rounded-xl gencl:mb-4 gencl:overflow-clip">
      <GroupCardSkeleton className="gencl:p-4" />
      <PostsGridSkeleton className="gencl:p-4" noOfPosts={6} />
    </div>
  );
}
