import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";

import { GroupSubscriptionButton } from "@molecules/group-subscription-button";
import { JoinGroupButton } from "@molecules/join-group-button";
import { ShareButton } from "@molecules/share-button";
import { GenericDetails } from "@organisms/generic-details";
import { GenericDetailsMetadata } from "@organisms/generic-details/generic-details-metadata";
import { MemberList } from "@organisms/member-list";
import { GroupCardSkeleton } from "@organisms/group-card";
import { PostsGridSkeleton } from "@organisms/posts-grid";
import {
  setQueryDataForJoinGroupStatusInCommunityGroups,
  setQueryDataForSubscriptionStatusInCommunityGroups,
  useGetCommunityGroups,
} from "@react-query/api/community/groups";
import { useGetCommunityMembers } from "@react-query/api/community/members";
import { Posts } from "./posts";
import { ComponentErrorState } from "@organisms/error-state-component";

type CommunityDetailsTabsPropsType = Omit<
  {
    slug: string;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function CommunityDetailsTabs({
  slug,
  className,
  ...restProps
}: CommunityDetailsTabsPropsType) {
  return (
    <Tabs
      defaultValue="posts"
      className={cn("gencl:w-full gencl:h-full", className)}
      {...restProps}
    >
      <TabsList className="">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        <CommunityGroups slug={slug} />
      </TabsContent>
      <TabsContent value="members">
        <CommunityMembers slug={slug} />
      </TabsContent>
    </Tabs>
  );
}

// TODO: USE <GroupCard/> component here.
function CommunityGroups({ slug }: { slug: string }) {
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
          <Posts groupSlug={group.slug} communitySlug={slug} />
        )}
      </GenericDetails>
    );
  });
}

// TODO: owner is missing here.
function CommunityMembers({ slug }: { slug: string }) {
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
        isOwner: false,
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
