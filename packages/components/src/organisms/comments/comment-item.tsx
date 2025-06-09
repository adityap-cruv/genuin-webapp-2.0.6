import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { SparkIcon } from "@genuin/ui/icons";

import type { CommentListType } from "src/react-query/api/comments";
import { getTimeAgo } from "@genuin/ui/utils";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { ProfileLink } from "@molecules/profile-link";

import { Audio } from "src/organisms/comments/audio";
import { Video } from "src/organisms/comments/video";

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
        size="md"
      />
      <div className="gencl:space-y-2">
        <div className="gencl:flex">
          <ProfileLink
            url={buildPageUrl({ type: "profile", slug: owner.nickname })}
          >
            @{owner.nickname}
          </ProfileLink>
          <span className="gencl:text-body-1-medium gencl:text-secondary-500">
            &nbsp; {comment.createdAt && getTimeAgo(comment.createdAt)}
          </span>
        </div>
        <CommentContent comment={comment} />
        <div className="gencl:flex gencl:items-center">
          <SparkIcon className="gencl:size-4" />
          <p className="gencl:text-body-2-medium gencl:text-secondary-300">
            {comment.noOfSparks}
          </p>
        </div>
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
          className="gencl:text-body-1-medium gencl:text-secondary-900 gencl:break-all"
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
