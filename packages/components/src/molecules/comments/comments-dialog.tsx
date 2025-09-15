import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@genuin/ui/components/dialog";
import { ComponentProps, ReactNode } from "react";
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
  shareUrl: string;
  defaultOpen: boolean;
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
  /**
   * @param videoId - The video id
   * @param increment - true to increment, false to decrement
   */
  onCommentCountChange?: (videoId: string, increment?: boolean) => void;
} & React.ComponentProps<typeof DialogTrigger>;

export function CommentsDialog({
  communityId,
  loopId,
  videoId,
  videoSlug,
  children,
  commentCount,
  shareUrl,
  className,
  defaultOpen,
  onOpenChange,
  onCommentCountChange,
  ...props
}: CommentDialogProps) {
  return (
    <Dialog
      type="comment-dialog"
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger className={className} {...props}>
        {children}
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="gencl:max-h-[80vh] gencl:flex gencl:flex-col gencl:overflow-clip gencl:h-full gencl:p-0 gencl:gap-0"
      >
        <DialogHeader className="gencl:py-4 gencl:text-body-0-semi-bold">
          Comments({commentCount})
        </DialogHeader>
        <CommentsList
          videoId={videoId}
          showCloseButton={false}
          shareUrl={shareUrl}
          className="gencl:pt-4"
          onCommentCountChange={onCommentCountChange}
        />
        <CommentInputBox
          className="gencl:absolute gencl:bottom-0"
          communityId={communityId}
          shareUrl={shareUrl}
          loopId={loopId}
          videoId={videoId}
          videoSlug={videoSlug}
          onCommentPosted={(comments) => {
            setQueryDataForNewComment(videoId, comments);
            onCommentCountChange?.(videoId);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
