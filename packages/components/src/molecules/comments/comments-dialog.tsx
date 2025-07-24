import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@genuin/ui/components/dialog";
import { ReactNode } from "react";
import { CommentsList } from "./comments-list";
import { CommentInputBox } from "./comment-input";
import { setQueryDataForNewComment } from "@genuin/components/react-query/api/comments";

type CommentDialogProps = {
  communityId: string;
  loopId: string;
  videoId: string;
  videoSlug: string;
  children: ReactNode;
  commentCount: number;
} & React.ComponentProps<typeof DialogTrigger>;

export function CommentsDialog({
  communityId,
  loopId,
  videoId,
  videoSlug,
  children,
  commentCount,
  className,
  ...props
}: CommentDialogProps) {
  return (
    <Dialog type="comment-dialog">
      <DialogTrigger className={className} {...props}>
        {children}
      </DialogTrigger>
      <DialogContent className="gencl:max-h-[80vh] gencl:flex gencl:flex-col gencl:overflow-clip gencl:h-full gencl:p-0 gencl:gap-0">
        <DialogHeader className="gencl:py-4 gencl:text-body-0-semi-bold">
          Comments({commentCount})
        </DialogHeader>
        <CommentsList
          videoId={videoId}
          showCloseButton={false}
          className="gencl:pt-4"
        />
        <CommentInputBox
          className="gencl:absolute gencl:bottom-0"
          communityId={communityId}
          loopId={loopId}
          videoId={videoId}
          videoSlug={videoSlug}
          onCommentPosted={(comments) => {
            setQueryDataForNewComment(videoId, comments);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
