"use client";

import { DangerIcon } from "@genuin/ui/icons";
import { useEffect } from "react";

import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";

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
  useEffect(() => {
    SDKEventEmitter.emit(SDKEventName.ERROR, {
      isError: true,
      isNoContent: false,
    });
  }, []);

  return (
    <div
      className="gencl:bg-secondary-200 gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:rounded-md gencl:gap-4"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}>
      <DangerIcon size="xl" />
      <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:text-center">{message}</p>
    </div>
  );
}
