import { ComponentProps, useMemo } from "react";
import { cn } from "@genuin/ui/lib/utils";
import type { VideoTopResultType } from "@genuin/components/react-query/api/search";
import { PostsGrid } from "@genuin/components/organisms/posts-grid";
import type { PostTileDataType } from "@genuin/components/molecules/post-tile";
import { ComponentErrorState } from "@genuin/components/organisms/error-state-component";
import { urlGenerators } from "../../../shared";

type PostsTabProps = {
  posts: VideoTopResultType[];
} & ComponentProps<"div">;

export function PostsTab({ posts, className, ...restProps }: PostsTabProps) {
  // Transform VideoTopResultType data to PostTileDataType format
  const transformedPosts: PostTileDataType[] = useMemo(() => {
    return posts.map((post) => ({
      postId: post.message_id,
      imageUrl: post.thumbnail_url || "",
      isPinned: false, // This information is not available in VideoTopResultType
      linkouts: undefined, // This information is not available in VideoTopResultType
      url: urlGenerators.video(post.slug),

      stats: {
        views: post.no_of_views,
        comments: post.no_of_comments,
        reactions: post.no_of_reactions,
      },
    }));
  }, [posts]);

  return (
    <div className={cn("gencl:mb-2", className)} {...restProps}>
      {posts.length === 0 ? (
        <div className="gencl:flex gencl:items-center gencl:justify-center">
          <ComponentErrorState
            type="NO_POSTS"
            forList={false}
            title="No posts found"
            subtitle="Try searching with different keywords"
          />
        </div>
      ) : (
        <PostsGrid
          posts={transformedPosts}
          isLoading={false}
          isError={false}
          gridClassName="gencl:grid-cols-3! gencl:lg:grid-cols-3! gencl:xl:grid-cols-3! gencl:2xl:grid-cols-3!"
          hasNextPage={false}
          fetchNextPage={() => {}}
          isFetchingNextPage={false}
          lazyLoad="manual"
          shouldCloseModal={true}
        />
      )}
    </div>
  );
}
