"use client";

import { DangerIcon } from "@genuin/ui/icons";

interface ErrorStateProps {
  containerHeight?: number | string;
  containerWidth?: number | string;
  message?: string;
}

export function SdkErrorState({
  containerHeight,
  containerWidth,
  message = "We're unable to load videos, refresh and try again.",
}: ErrorStateProps) {
  return (
    <div
      className="gencl:bg-secondary-200 gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:rounded-md gencl:gap-4"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
    >
      <DangerIcon size="xl" />
      <p className="gencl:text-body-1-medium gencl:text-secondary-600">
        {message}
      </p>
    </div>
  );
}
