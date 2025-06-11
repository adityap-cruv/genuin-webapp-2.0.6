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
import { useGetCommunityGroups } from "@react-query/api/community/groups";
import { useGetCommunityMembers } from "@react-query/api/community/members";
import { Posts } from "./posts";

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
  // todo: handle if community groups doesn't exist
  if (isError) {
    return <div>Handle error state for the community groups</div>;
  }

  // todo: handle if community groups is empty
  if (!communityGroups || communityGroups.groups.length === 0) {
    return <div>No community groups available.</div>;
  }

  const groups = communityGroups.groups;

  return groups.map((group) => (
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
          <JoinGroupButton buttonText="Join" />
          <GroupSubscriptionButton showText={false} />
          <ShareButton showText={false} />
        </div>
      }
    >
      <Posts groupSlug={group.slug} communitySlug={slug} />
    </GenericDetails>
  ));
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
