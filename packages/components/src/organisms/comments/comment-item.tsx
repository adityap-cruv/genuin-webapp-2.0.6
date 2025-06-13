import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { SparkIcon } from "@genuin/ui/icons";

import type { CommentListType } from "src/react-query/api/comments";
import { getTimeAgo } from "@genuin/ui/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { ProfileLink } from "@molecules/profile-link";
import { Skeleton } from "@genuin/ui/components/skeleton";

import { Audio } from "@organisms/comments/audio";
import { Video } from "@organisms/comments/video";
import { CommentMenu } from "./comment-menu";
import { ReactionButton } from "@molecules/reaction-button";

export type CommentItemProps = {
  comment: CommentListType[number];
};

// TODO: Check why brand is not handled in the comment item
export function CommentItem({ comment }: CommentItemProps) {
  const { owner } = comment;
  return (
    <div className="comment gencl:flex gencl:gap-2" key={comment.commentId}>
      <Avatar
        alt={owner.nickname}
        imageUrl={owner.profileImage}
        isAvatar={owner.isAvatar}
      />
      <div className="gencl:space-y-2 gencl:w-full">
        <div className="gencl:flex gencl:items-center gencl:justify-between">
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
          <CommentMenu contentId={comment.commentId} />
        </div>
        <CommentContent comment={comment} />
        <div className="gencl:flex gencl:items-center">
          <ReactionButton
            contentId={comment.commentId}
            contentType="COMMENT"
            isReacted={comment.isSparked}
            reactionCount={comment.noOfSparks}
          />
        </div>
      </div>
    </div>
  );
}

export function CommentsItemSkeleton() {
  return (
    <div className="gencl:w-100 gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-4">
      <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
        <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
        <Skeleton className="gencl:w-4 gencl:h-5  gencl:rounded-md" />
      </div>
    </div>
  );
}

export function CommentContent({ comment }: CommentItemProps) {
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
