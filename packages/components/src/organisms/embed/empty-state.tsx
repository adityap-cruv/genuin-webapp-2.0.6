"use client";

import { PlayIcon } from "@genuin/ui/icons";
import { useEffect } from "react";

interface EmptyStateProps {
  containerHeight?: number | string;
  containerWidth?: number | string;
  message?: string;
}

export function SdkEmptyState({
  containerHeight,
  containerWidth,
  message = "No content available",
}: EmptyStateProps) {

  useEffect(() => {
    if (!window.genuin) return;
    window.genuin.emit("sdk:noContent", {
      isError: false,
      isNoContent: true,
    });
  }, []);

  return (
    <div
      className="gencl:bg-secondary-200 gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:rounded-md gencl:gap-4"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
    >
      <PlayIcon size="xl" />
      <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:text-center">
        {message}
      </p>
    </div>
  );
}
