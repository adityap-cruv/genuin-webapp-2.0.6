"use client";
import { cn } from "@genuin/ui/lib/utils";
import React from "react";

import { ClipButton } from "./clip-button";
import { EditCoverButton } from "./edit-cover-button";

type VideoEditActionButtonsProps = {
  clipVideo?: boolean;
  editCover?: boolean;
  onClickClip: () => void;
  onClickEditCover: () => void;
};

export const VideoEditActionButtons: React.FC<VideoEditActionButtonsProps> = ({
  clipVideo,
  editCover,
  onClickClip,
  onClickEditCover,
}) => {
  if (!clipVideo && !editCover) return null;

  return (
    <div
      className={cn(
        "gencl:flex gencl:items-center gencl:mb-2",
        clipVideo && editCover ? "gencl:justify-between" : clipVideo ? "gencl:justify-start" : "gencl:justify-end"
      )}>
      {clipVideo && <ClipButton onClick={onClickClip} />}
      {editCover && <EditCoverButton onClick={onClickEditCover} />}
    </div>
  );
};
