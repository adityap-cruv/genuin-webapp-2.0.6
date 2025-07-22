import { cn } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import { setQueryDataForNewComment } from "@genuin/components/react-query/api/comments";
import { CommentInputBox } from "./comment-input";
import { X } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import { CommentsList } from "./comments-list";

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
  onClose?: () => void;
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
  onClose,
  ...restProps
}: CommentPropsType) {
  return (
    <div className={cn(commentsVariant({ variant }), className)} {...restProps}>
      {showCloseButton && (
        <X
          className="gencl:absolute gencl:top-2 gencl:right-2 gencl:cursor-pointer"
          onClick={() => {
            onClose?.();
          }}
        />
      )}
      <CommentsList videoId={videoId} showCloseButton={showCloseButton} />
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
