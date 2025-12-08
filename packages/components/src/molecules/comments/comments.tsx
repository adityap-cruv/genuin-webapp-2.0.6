import { cn } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import { setQueryDataForNewComment } from "@genuin/components/react-query/api/comments";
import { CommentInputBox } from "./comment-input";
import { X } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import { CommentsList } from "./comments-list";
import { Button } from "@genuin/ui";

const commentsVariant = cva("gencl:relative gencl:bg-white", {
  variants: {
    variant: {
      default:
        "gencl:overflow-clip gencl:border gencl:border-secondary-200 gencl:rounded-2xl",
      dialog: "gencl:overflow-auto gencl:h-full gencl:flex gencl:flex-col",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type CommentPropsType = {
  videoId: string;
  loopId: string;
  communityId: string;
  videoSlug: string;
  showCloseButton?: boolean;
  shareUrl: string;
  onClose?: () => void;
  /**
   * @param videoId - The video id
   * @param increment - true to increment, false to decrement
   */
  onCommentCountChange?: (videoId: string, increment?: boolean) => void;
} & ComponentProps<"div"> &
  VariantProps<typeof commentsVariant>;

export function Comments({
  videoId,
  loopId,
  communityId,
  videoSlug,
  className,
  showCloseButton = false,
  variant,
  shareUrl,
  onClose,
  onCommentCountChange,
  ...restProps
}: CommentPropsType) {
  return (
    <div
      className={cn(
        commentsVariant({ variant }),
        "gencl:relative gencl:flex gencl:flex-col gencl:h-full",
        className
      )}
      {...restProps}
    >
      {/* {showCloseButton && (
        <X
          className="gencl:absolute gencl:top-2 gencl:right-2 gencl:cursor-pointer"
          onClick={() => {
            onClose?.();
          }}
        />
      )} */}
      {showCloseButton && (
        <div className="gencl:p-4 gencl:flex  gencl:border-b gencl:border-secondary-150 gencl:items-center gencl:justify-between">
          <p className="gencl:text-headline-4-semi-bold gencl:text-secondary-900">
            Comments
          </p>
          <Button
            theme="custom"
            variant="icon"
            className="gencl:size-5!"
            onClick={onClose}
          >
            <X className="gencl:size-5 gencl:cursor-pointer gencl:opacity-70 gencl:transition-opacity gencl:hover:opacity-100" />
          </Button>
        </div>
      )}
      <div className="gencl:flex-1 gencl:overflow-y-auto gencl:min-h-0">
        <CommentsList
          videoId={videoId}
          shareUrl={shareUrl}
          videoSlug={videoSlug}
          showCloseButton={showCloseButton}
          onCommentCountChange={onCommentCountChange}
          className="gencl:pb-24 gencl:h-full"
        />
      </div>
      <CommentInputBox
        videoId={videoId}
        loopId={loopId}
        communityId={communityId}
        videoSlug={videoSlug}
        shareUrl={shareUrl}
        onCommentPosted={(comments) => {
          setQueryDataForNewComment(videoId, comments);
          onCommentCountChange?.(videoId);
        }}
      />
    </div>
  );
}
