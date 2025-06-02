import { Loader } from "@genuin/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";

import { GroupSubscriptionButton } from "src/molecules/group-subscription-button";
import { JoinGroupButton } from "src/molecules/join-group-button";
import { ShareButton } from "src/molecules/share-button";
import { GenericDetails } from "src/organisms";
import { GenericDetailsMetadata } from "src/organisms/generic-details/generic-details-metadata";
import { GroupPosts } from "src/organisms/group-posts";
import { useGetCommunityGroups } from "src/react-query/api/community/groups";

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
      <TabsContent value="posts" className="gencl:px-4">
        <CommunityGroups slug={slug} />
      </TabsContent>
      <TabsContent value="members">
        <CommunityMembers slug={slug} />
      </TabsContent>
    </Tabs>
  );
}

function CommunityGroups({ slug }: { slug: string }) {
  const {
    data: communityGroups,
    isLoading,
    isError,
  } = useGetCommunityGroups(slug);

  // TODO: handle community groups shimmer
  if (isLoading) {
    return <Loader size="md" />;
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
      metadata={
        <GenericDetailsMetadata
          privacyInfo={{ isPrivate: !group.is_view_allowed }}
          stats={{
            members: group.group.no_of_members,
            posts: group.group.no_of_videos,
            views: group.group.no_of_views,
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
      <GroupPosts
        slug={group.slug}
        className="gencl:bg-secondary-50 gencl:p-4"
      />
    </GenericDetails>
  ));
}

function CommunityMembers({ slug }: { slug: string }) {
  return <div>Community members content goes here.</div>;
}
