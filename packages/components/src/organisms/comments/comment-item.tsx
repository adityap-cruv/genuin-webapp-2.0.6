import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";

import type { CommentListType } from "src/react-query/api/comments";
import { cn, getTimeAgo } from "@genuin/ui/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { Skeleton } from "@genuin/ui/components/skeleton";

import { Audio } from "@genuin/components/organisms/comments/audio";
import { Video } from "@genuin/components/organisms/comments/video";
import { CommentMenu } from "./comment-menu";
import {
  DynamicReactionIcon,
  ReactionButton,
} from "@genuin/components/molecules/reaction-button";
import { ComponentProps } from "react";

export type CommentItemProps = {
  comment: CommentListType[number];
  onReactionStateChange: ComponentProps<
    typeof ReactionButton
  >["onReactionStateChange"];
};

// TODO: Check why brand is not handled in the comment item
export function CommentItem({
  comment,
  onReactionStateChange,
}: CommentItemProps) {
  const { owner } = comment;
  return (
    <div
      className="comment gencl:flex gencl:gap-2 gencl:group"
      key={comment.commentId}
    >
      <Avatar
        alt={owner.nickname}
        imageUrl={owner.profileImage}
        isAvatar={owner.isAvatar}
      />
      <div className="gencl:space-y-2 gencl:w-full">
        <div className="gencl:flex gencl:items-center gencl:h-4 gencl:justify-between">
          <div className="gencl:flex gencl:items-center">
            <ProfileLink
              className="gencl:text-body-1-semi-bold"
              url={buildPageUrl({ type: "profile", slug: owner.nickname })}
            >
              @{owner.nickname}
            </ProfileLink>
            <span className="gencl:text-body-1-medium gencl:text-secondary-500">
              &nbsp; {comment.createdAt && getTimeAgo(comment.createdAt)}
            </span>
          </div>
          <CommentMenu
            contentId={comment.commentId}
            className="gencl:group-hover:block gencl:data-[state=open]:block  gencl:hidden"
          />
        </div>
        <CommentContent comment={comment} />
        <div className="gencl:flex gencl:items-center">
          <ReactionButton
            contentId={comment.commentId}
            contentType="COMMENT"
            isReacted={comment.isSparked}
            reactionCount={comment.noOfSparks}
            onReactionStateChange={onReactionStateChange}
            withCustomChildren
          >
            <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:cursor-pointer">
              <DynamicReactionIcon
                isSparked={comment.isSparked}
                sparkCount={comment.noOfSparks}
                variant="light"
                iconHeight={16}
                iconWidth={16}
              />
              <p className="gencl:text-body-2-medium gencl:text-secondary-600">
                {comment.noOfSparks}
              </p>
            </div>
          </ReactionButton>
        </div>
      </div>
    </div>
  );
}

export function CommentsItemSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-4">
      <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
        <Skeleton className="gencl:w-4 gencl:h-5  gencl:rounded-md" />
      </div>
    </div>
  );
}

export function CommentContent({
  comment,
}: {
  comment: CommentListType[number];
}) {
  return (
    <>
      {comment.type === "text" && (
        <ReadMore
          text={comment.commentText}
          maxLines={2}
          textClassName="gencl:text-secondary-900 gencl:break-all gencl:text-body-1-medium"
        />
      )}
      {comment.type === "video" && (
        <Video
          videoUrl={comment.videoUrlM3u8 || ""}
          thumbnail={comment.thumbnail || ""}
        />
      )}
      {comment.type === "audio" && <Audio audioUrl={comment.audioUrl || ""} />}
    </>
  );
}
