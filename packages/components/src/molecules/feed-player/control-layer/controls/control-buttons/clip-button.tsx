// ClipButton.tsx
"use client";
import { TrimIcon } from "@genuin/ui/icons";
import React from "react";

type ClipButtonProps = {
  onClick: () => void;
};

export const ClipButton: React.FC<ClipButtonProps> = ({ onClick }) => {
  return (
    <div
      className="gencl:flex gencl:items-center gencl:justify-center gencl:h-12 gencl:w-12 gencl:!bg-black/40 gencl:backdrop-blur-sm gencl:text-body-1-semi-bold gencl:text-white gencl:rounded-full gencl:cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}>
      <TrimIcon />
    </div>
  );
};
