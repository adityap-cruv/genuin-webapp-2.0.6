import { Button } from "@genuin/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/components/popover";
import { ThreeDotsIcon } from "@genuin/ui/icons";
import { getRootContainer } from "@genuin/ui/lib/shadow-dom.utils";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useState, useCallback, useEffect } from "react";

import type { VideoTypes } from "@genuin/components/context";
import { Report } from "@genuin/components/molecules/report";

import { DeleteComment } from "../delete-comment";

type CommentMenuPropsType = ComponentProps<typeof PopoverTrigger> & {
  contentId: string;
  ownerId?: string;
  userId?: string;
  videoId: string;
  onCommentCountChange?: ComponentProps<typeof DeleteComment>["onCommentCountChange"];
  videoType: VideoTypes;
};

export function CommentMenu({
  contentId,
  className,
  ownerId,
  userId,
  videoId,
  videoType,
  onCommentCountChange,
  ...restProps
}: CommentMenuPropsType) {
  const [open, setOpen] = useState(false);
  const closePopover = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    // The popover content is portalled into a shadow root, so normal document-level listeners won't catch events inside it.
    // getRootContainer() returns the shadow root (or document.body as fallback).
    const container = getRootContainer();
    const eventTarget: EventTarget = container instanceof ShadowRoot ? container : (container ?? document);

    const handlePopover = () => setOpen(false);
    eventTarget.addEventListener("scroll", handlePopover, true);
    return () => {
      eventTarget.removeEventListener("scroll", handlePopover, true);
    };
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn("gencl:p-1 gencl:rounded-lg gencl:hover:bg-secondary-100", className)}
        {...restProps}>
        <ThreeDotsIcon className="gencl:h-4 gencl:w-4" />
      </PopoverTrigger>
      <PopoverContent className="gencl:p-0 gencl:border-secondary-150 gencl:w-fit gencl:rounded-xl" align="end">
        {ownerId !== userId ? (
          <Report reportFor="COMMENT" contentId={contentId} type="report-comment-dialog" onClose={closePopover}>
            <div className="gencl:p-3 gencl:rounded-xl gencl:border-secondary-100 gencl:bg-white gencl:cursor-pointer gencl:text-primary">
              <Button
                theme="text"
                className="gencl:!text-error-status gencl:text-body-1-medium gencl:hover:bg-secondary-100 gencl:h-fit gencl:px-0">
                Report
              </Button>
            </div>
          </Report>
        ) : (
          <DeleteComment
            contentId={contentId}
            videoId={videoId}
            videoType={videoType}
            onCommentCountChange={onCommentCountChange}
            type="delete-comment-dialog"
            onClose={closePopover}>
            <div className="gencl:p-3 gencl:rounded-xl gencl:border-secondary-100 gencl:bg-white gencl:cursor-pointer gencl:text-primary">
              <Button
                theme="text"
                className="gencl:!text-error-status gencl:text-body-1-medium gencl:hover:bg-secondary-100 gencl:h-fit gencl:px-0">
                Delete
              </Button>
            </div>
          </DeleteComment>
        )}
      </PopoverContent>
    </Popover>
  );
}
