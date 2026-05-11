// EditCoverButton.tsx
"use client";
import React from "react";

type EditCoverButtonProps = {
  onClick: () => void;
};

export const EditCoverButton: React.FC<EditCoverButtonProps> = ({ onClick }) => {
  return (
    <div
      className="gencl:!bg-black/40 gencl:backdrop-blur-sm gencl:text-body-1-semi-bold gencl:text-white gencl:py-2 gencl:px-3 gencl:rounded-md gencl:cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}>
      Edit Cover
    </div>
  );
};
