import { Tabs, TabsContent, TabsList, TabsTrigger } from "@genuin/ui/tabs";
import { cn } from "@genuin/ui/utils";
import { useMemo } from "react";
import { PostsGrid } from "src/organisms/posts-grid";
import { useGetGroupFeed } from "src/react-query/api/group/feed";

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
        <TabsTrigger value="members">Member</TabsTrigger>
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
  return <div>Group member</div>;
}
