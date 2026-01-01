"use client";

import { ReactNode, useEffect, useState } from "react";
import { DiamondIcon, TickRoundIcon } from "@genuin/ui/icons";

import { Breadcrumb } from "@genuin/components/molecules/breadcrumb";
import { StepPost } from "../create-post/types";
import { Button } from "@genuin/ui/components/button";
import { Loader } from "@genuin/ui/components/loader";

type PostLayoutProps = {
  isEdit: boolean;
  children: ReactNode;
  postCountText?: string;
  onCancel?: (type: StepPost) => void;
  onNext?: (type: StepPost) => void;
  isPostDisabled?: boolean;
  bottomMessage?: string;
  bottomMessageKey?: number;
  stepNextButton: StepPost;
  isLoading?: boolean;
};

const getBreadcrumbItems = (step: StepPost, isEdit: boolean) => {
  switch (step) {
    case "UPLOAD":
    case "POST":
      return [
        { label: "My Videos", href: "/posts" },
        { label: isEdit ? "Edit Post" : "Create New Post" },
      ];
    case "EDIT_THUMBNAIL":
    case "CLIP_VIDEO":
      return [
        { label: "My Videos", href: "/posts" },
        {
          label: isEdit ? "Edit Post" : "Create New Post",
          href: "/posts/create",
        },
        { label: "Edit Video" },
      ];
    default:
      return [];
  }
};

const getPrimaryButtonLabel = (step: StepPost) => {
  switch (step) {
    case "UPLOAD":
      return "Next";
    case "EDIT_THUMBNAIL":
    case "CLIP_VIDEO":
      return "Done";
    case "POST":
      return "Post";
    default:
      return "Continue";
  }
};

export const PostLayout: React.FC<PostLayoutProps> = ({
  isEdit,
  children,
  postCountText,
  onCancel,
  onNext,
  isPostDisabled,
  bottomMessage,
  bottomMessageKey,
  stepNextButton,
  isLoading,
}: PostLayoutProps) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (bottomMessage) {
      setShowMessage(true);

      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [bottomMessageKey]);

  return (
    <div className="gencl:w-full gencl:h-screen gencl:bg-secondary-50">
      <div className="gencl:flex gencl:flex-col gencl:max-w-5xl gencl:h-screen gencl:mx-auto">
        {/* Header */}
        <div className="gencl:flex gencl:justify-between gencl:items-center gencl:border-b gencl:border-secondary-150 gencl:bg-white gencl:p-6">
          <Breadcrumb items={getBreadcrumbItems(stepNextButton, isEdit)} />
          {postCountText && (
            <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:text-body-1-semi-bold gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:px-3 gencl:py-1.5">
              <DiamondIcon />
              {postCountText}
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="gencl:h-[calc(100%-200px)]">{children}</div>

        {/* Footer */}
        <div className="gencl:w-full gencl:flex gencl:justify-between gencl:items-center gencl:border-t gencl:border-secondary-150 gencl:bg-white gencl:p-3">
          <span
            className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-body-1-medium gencl:text-secondary-900 gencl:transition-opacity gencl:duration-300"
            style={{ opacity: showMessage ? 1 : 0 }}
          >
            {bottomMessage && (
              <>
                <TickRoundIcon />
                {bottomMessage}
              </>
            )}
          </span>
          <div className="gencl:flex gencl:gap-2">
            <Button theme="custom" onClick={() => onCancel?.(stepNextButton)}>
              Cancel
            </Button>
            <Button
              theme="primary"
              onClick={() => onNext?.(stepNextButton)}
              disabled={isPostDisabled}
            >
              {isLoading && <Loader />}
              {getPrimaryButtonLabel(stepNextButton)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
