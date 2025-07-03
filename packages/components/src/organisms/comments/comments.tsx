import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { CommentIcon, ErrorIcon, XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { useMemo, type ComponentProps } from "react";

import {
  handleReactionStateChangeInComments,
  setQueryDataForNewComment,
  useComments,
} from "@genuin/components/react-query/api/comments";
import { CommentItem, CommentsItemSkeleton } from "./comment-item";
import { CommentInputBox } from "./comment-box";

type CommentPropsType = {
  videoId: string;
  loopId: string;
  communityId: string;
  videoSlug: string;
  showCloseButton?: boolean;
  onClose?: () => void;
} & ComponentProps<"div">;

export function Comments({
  videoId,
  loopId,
  communityId,
  videoSlug,
  className,
  showCloseButton = false,
  onClose,
  ...restProps
}: CommentPropsType) {
  return (
    <div
      className={cn(
        "gencl:relative gencl:bg-white gencl:overflow-clip gencl:border gencl:border-secondary-150 gencl:rounded-2xl",
        className
      )}
      {...restProps}
    >
      {showCloseButton && (
        <div className="gencl:p-4 gencl:flex gencl:text-headline-4-semi-bold gencl:text-secondary-900  gencl:border-b gencl:border-secondary-150 gencl:items-center gencl:justify-between">
          Comments
          <XIcon
            className="gencl:size-5 gencl:cursor-pointer gencl:opacity-70 gencl:transition-opacity gencl:hover:opacity-100"
            onClick={() => {
              onClose?.();
            }}
          />
        </div>
      )}

      <CommentsComponent videoId={videoId} showCloseButton={showCloseButton} />
      <CommentInputBox
        videoId={videoId}
        loopId={loopId}
        communityId={communityId}
        videoSlug={videoSlug}
        onCommentPosted={(comments) => {
          setQueryDataForNewComment(videoId, comments);
        }}
      />
    </div>
  );
}

function CommentsComponent({
  videoId,
  showCloseButton,
}: {
  videoId: string;
  showCloseButton: boolean;
}) {
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
      <div className="gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:shrink-0 gencl:p-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <CommentsItemSkeleton key={index} />
        ))}
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
      <div
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
      </div>
    );
  }
}
