"use client";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { CommentIcon, ErrorIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import React, {
  ComponentProps,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  handleReactionStateChangeInComments,
  useComments,
} from "@genuin/components/react-query/api/comments";

import { CommentItem, CommentsItemSkeleton } from "./comment-item";
import { DeleteComment } from "../delete-comment";

type CommentListProps = {
  videoId: string;
  showCloseButton: boolean;
  shareUrl: string;
  videoSlug: string;
  onCommentCountChange?: ComponentProps<
    typeof DeleteComment
  >["onCommentCountChange"];
} & ComponentProps<"div">;

export const CommentsList = memo(function CommentsList({
  videoId,
  showCloseButton,
  className,
  shareUrl,
  videoSlug,
  onCommentCountChange,
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

  const handleReactionStateChange = useCallback(
    (commentId: string, isReacted: boolean) => {
      handleReactionStateChangeInComments(videoId, commentId, isReacted);
    },
    [videoId],
  );

  const [isCommentsLoaded, setIsCommentsLoaded] = useState(false);
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      setIsCommentsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const comments = useMemo(() => {
    return data?.pages.flatMap((page) => page.comments);
  }, [data]);

  if (isError) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:justify-center gencl:h-full gencl:flex-col gencl:gap-4",
          className,
        )}
        {...restProps}
      >
        <ErrorIcon className="gencl:w-8 gencl:h-8" />
        <p className="gencl:text-body-2-medium gencl:text-secondary-300">
          We’re unable to load comments.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:shrink-0 gencl:p-4",
          className,
        )}
        {...restProps}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <CommentsItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div
        className={cn(
          "gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center gencl:justify-center",
          className,
        )}
        {...restProps}
      >
        <CommentIcon size="xl" />
        <div className="gencl:space-y-1">
          <p className="gencl:text-body-0-semi-bold gencl:text-center">
            No Comments Yet
          </p>
          <p className="gencl:text-secondary-600 gencl:text-body-2-medium">
            Be the first one to comment!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "gencl:h-full gencl:w-full gencl:overflow-auto gencl:p-4 gencl:space-y-4 gencl:!pb-16",
        className,
      )}
      {...restProps}
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
            shareUrl={shareUrl}
            videoId={videoId}
            videoSlug={videoSlug}
            onCommentCountChange={onCommentCountChange}
            onReactionStateChange={handleReactionStateChange}
            isCommentsLoaded={isCommentsLoaded}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
});
