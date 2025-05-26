import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { Loader } from "@genuin/ui/loader";
import { CommentIcon, ErrorIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { useMemo, type ComponentProps } from "react";

import { useComments } from "src/react-query/api/comments";

import { CommentItem } from "./comment-item";

type CommentPropsType = {
  videoId: string;
} & ComponentProps<"div">;

export function Comments({
  videoId,
  className,
  ...restProps
}: CommentPropsType) {
  // TODO: Create a comments shimmer
  return (
    <div
      className={cn(
        "gencl:relative gencl:bg-white gencl:overflow-clip gencl:border gencl:border-secondary-200 gencl:rounded-2xl",
        className
      )}
      {...restProps}
    >
      <CommentsComponent videoId={videoId} />
      <CommentInputBox />
    </div>
  );
}

function CommentsComponent({ videoId }: { videoId: string }) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useComments(videoId);

  const comments = useMemo(
    () => data?.pages.flatMap((page) => page.comments),
    [data]
  );

  if (isError) {
    return (
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:h-full gencl:flex-col gencl:gap-4">
        <ErrorIcon className="gencl:w-8 gencl:h-8" />
        <p className="gencl:text-body-2-medium gencl:text-secondary-300">
          We’re unable to load comments.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="gencl:w-full gencl:h-full gencl:flex gencl:items-center gencl:justify-center">
        <Loader size="md" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center gencl:justify-center">
        <CommentIcon className="gencl:w-8 gencl:h-8" />
        <div className="gencl:space-y-1">
          <p className="gencl:text-body-0-semi-bold gencl:text-center">
            No Comments Yet
          </p>
          <p className="gencl:text-secondary-300 gencl:text-body-2-medium">
            Be the first one to comment!
          </p>
        </div>
      </div>
    );
  }

  if (comments && comments.length !== 0) {
    return (
      <div className="gencl:h-full gencl:w-full gencl:overflow-auto gencl:p-4 gencl:space-y-4 gencl:pb-16">
        <InfiniteScroll
          isLoadingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          getNextPage={fetchNextPage}
        >
          {comments.map((comment) => (
            <CommentItem key={comment.commentId} comment={comment} />
          ))}
        </InfiniteScroll>
      </div>
    );
  }
}

function CommentInputBox() {
  return (
    <div className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:bg-white gencl:p-4 gencl:border-t gencl:border-secondary-200">
      Comment input box design for mention is pending.
    </div>
  );
}
