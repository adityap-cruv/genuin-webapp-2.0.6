"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@genuin/ui/dialog";
import React, { ComponentProps, useCallback, useState } from "react";
import { Button } from "@genuin/ui/button";
import { Loader } from "@genuin/ui/loader";
import { useAnalytics } from "@genuin/components/context/analytics";
import {
  deleteCommentFromQueryData,
  useDeleteCommentMutation,
} from "@genuin/components/react-query/api/comments";
import { Toast } from "@genuin/ui/toaster";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useBaseContext } from "@genuin/components/context";

type ReportProps = ComponentProps<typeof Dialog> & {
  contentId: string;
  videoId: string;
  children: React.ReactNode;
  onCommentCountChange?: (videoId: string, increment?: boolean) => void;
};

export function DeleteComment({
  contentId,
  videoId,
  children,
  onCommentCountChange,
  ...props
}: ReportProps) {
  const { track, EventName } = useAnalytics();
  const { isMobile } = useDeviceDetectMediaQuery();
  const [isOpen, setIsOpen] = useState(false);
  const { useShadowDOM } = useBaseContext();

  const deleteCommentMutation = useDeleteCommentMutation({
    onSuccess: () => {
      // Close the dialog
      setIsOpen(false);
      deleteCommentFromQueryData({ commentId: contentId, videoId });

      // Call the comment count change callback to decrement the count
      onCommentCountChange?.(videoId, false);

      track(EventName.COMMENT_DELETE, {
        content_id: contentId,
        video_id: videoId,
        content_category: "loop",
        event_record_screen: "feed",
        event_target_screen: "none",
      });

      Toast.Success({
        message: "Comment has been deleted",
      });
    },
    onError: (error) => {
      // Show error toast
      Toast.Error({
        message: "Comment could not be deleted, please try again.",
      });
    },
  });

  const handleDelete = useCallback(() => {
    deleteCommentMutation.mutate({ commentId: contentId });
  }, [deleteCommentMutation, contentId]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen} {...props}>
      <DialogTrigger className="gencl:!border-none">{children}</DialogTrigger>
      <DialogContent
        className="gencl:max-w-xl gencl:rounded-t-2xl! gencl:md:rounded-2xl! gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-5!"
      >
        <DialogHeader className="gencl:border-none gencl:text-center gencl:sm:text-start! gencl:gap-3 gencl:sm:gap-6!">
          <p className="gencl:text-headline-3-semi-bold gencl:text-black">
            Delete comment?
          </p>
          <p className="gencl:text-body-1-medium gencl:sm:text-body-0-medium! gencl:text-secondary-500 gencl:sm:text-black!">
            Are you sure you want to delete this comment? You won’t be able to
            get this comment back.
          </p>
        </DialogHeader>

        <div className="gencl:flex gencl:flex-col-reverse gencl:sm:flex-row! gencl:justify-end gencl:gap-2">
          <Button
            theme={isMobile ? "secondary" : "text"}
            className="gencl:text-body-0-semi-bold!"
            onClick={handleCancel}
            disabled={deleteCommentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            theme="primary"
            className="gencl:text-body-0-semi-bold! gencl:!text-white"
            onClick={handleDelete}
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? (
              <Loader className="gencl:size-4" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
