import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { CommentIcon, ErrorIcon, XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { ComponentProps, useMemo } from "react";

import {
  handleReactionStateChangeInComments,
  useComments,
} from "@genuin/components/react-query/api/comments";
import { CommentItem, CommentsItemSkeleton } from "./comment-item";

type CommentListProps = {
  videoId: string;
  showCloseButton: boolean;
} & ComponentProps<"div">;

export function CommentsList({
  videoId,
  showCloseButton,
  className,
  ...restProps
}: CommentListProps) {
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

  // Helper to render root div with consistent className/restProps
  function RootDiv({
    children,
    className: extraClass,
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={cn(extraClass, className)} {...restProps}>
        {children}
      </div>
    );
  }

  if (isError) {
    return (
      <RootDiv className="gencl:flex gencl:items-center gencl:justify-center gencl:h-full gencl:flex-col gencl:gap-4">
        <ErrorIcon className="gencl:w-8 gencl:h-8" />
        <p className="gencl:text-body-2-medium gencl:text-secondary-300">
          We’re unable to load comments.
        </p>
      </RootDiv>
    );
  }

  if (isLoading) {
    return (
      <RootDiv className="gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:shrink-0 gencl:p-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <CommentsItemSkeleton key={i} />
        ))}
      </RootDiv>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <RootDiv className="gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center gencl:justify-center">
        <CommentIcon size="xl" />
        <div className="gencl:space-y-1">
          <p className="gencl:text-body-0-semi-bold gencl:text-center">
            No Comments Yet
          </p>
          <p className="gencl:text-secondary-300 gencl:text-body-2-medium">
            Be the first one to comment!
          </p>
        </div>
      </RootDiv>
    );
  }

  if (comments && comments.length !== 0) {
    return (
      <RootDiv
        className={cn(
          "gencl:h-full gencl:w-full gencl:overflow-auto gencl:p-4 gencl:space-y-4 gencl:!pb-16"
        )}
      >
        <InfiniteScroll
          isLoadingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          getNextPage={fetchNextPage}
        >
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onReactionStateChange={(isReacted) => {
                handleReactionStateChangeInComments(
                  videoId,
                  comment.commentId,
                  isReacted
                );
              }}
            />
          ))}
        </InfiniteScroll>
      </RootDiv>
    );
  }
}
