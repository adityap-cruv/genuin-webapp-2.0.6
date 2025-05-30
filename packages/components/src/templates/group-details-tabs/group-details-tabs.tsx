import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";
import { useMemo } from "react";

import { MemberList } from "src/organisms/member-list";
import { PostsGrid } from "src/organisms/posts-grid";
import { useGetGroupFeed } from "src/react-query/api/group/feed";
import { useGetGroupMembers } from "src/react-query/api/group/members";

type GroupDetailsTabsProps = Omit<
  {
    slug: string;
  } & React.ComponentProps<typeof Tabs>,
  "defaultValue" | "defaultChecked" | "children"
>;

export function GroupDetailsTabs({
  slug,
  className,
  ...restProps
}: GroupDetailsTabsProps) {
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
        <GroupPosts slug={slug} />
      </TabsContent>
      <TabsContent value="members">
        <GroupMembers slug={slug} />
      </TabsContent>
    </Tabs>
  );
}

function GroupPosts({ slug }: { slug: string }) {
  const {
    isError,
    isLoading,
    isFetchingNextPage,
    data: feedData,
    fetchNextPage,
    hasNextPage,
  } = useGetGroupFeed(slug);
  const feed = useMemo(
    () => feedData?.pages.flatMap((page) => page.feed),
    [feedData]
  );

  return (
    <PostsGrid
      posts={
        feed?.map((post) => ({
          imageUrl: post.video.thumbnailM ?? post.video.thumbnail ?? "",
          postId: post.video.id,
          isPinned: post.video.isPinned,
          linkouts: null,
          stats: { comments: post.video.commentCount, shares: 0, views: 0 },
        })) ?? []
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isError={isError}
    />
  );
}

function GroupMembers({ slug }: { slug: string }) {
  const {
    isError,
    isLoading,
    data: membersData,
    fetchNextPage,
    hasNextPage,
  } = useGetGroupMembers(slug);

  const members = useMemo(
    () => membersData?.pages.flatMap((page) => page.members) ?? [],
    [membersData]
  );

  return (
    <MemberList
      className="gencl:max-w-md"
      isLoading={isLoading}
      isError={isError}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      members={members.map((member) => ({
        bio: member.bio ?? "",
        name: member.name ?? "",
        profileImage: {
          isAvatar: member.is_avatar,
          url: member.profile_image_m ?? member.profile_image ?? "",
        },
        userName: member.nickname ?? member.phone ?? member.member_id,
        isOwner: false,
        memberId: member.member_id,
        brand: member.brand,
        //TODO: handle url paths.
        url: `/${member.nickname}`,
      }))}
    />
  );
}
