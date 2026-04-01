"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@genuin/ui/dialog";
import React, { ComponentProps } from "react";
import PlaybackSpeedControlSlider from "./speed-control-buttons";
import { useBaseContext } from "@genuin/components/context";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { cn } from "@genuin/ui/lib/utils";

type PlaybackSpeedProps = ComponentProps<typeof Dialog> & {
  children: React.ReactNode;
};

export function PlaybackSpeed({ children, ...props }: PlaybackSpeedProps) {
  const { playbackSpeed, useShadowDOM } = useBaseContext();
  const { isTablet } = useDeviceDetectMediaQuery();
  return (
    <Dialog modal {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "gen-sdk-expand-view gencl:text-center gencl:bg-white gencl:sm:min-w-lg! gencl:md:min-w-xl! gencl:rounded-t-2xl! gencl:md:rounded-2xl! gencl:flex gencl:flex-col gencl:gap-4",
          isTablet ? "gencl:p-10" : "gencl:p-6",
        )}
      >
        <DialogHeader
          className={cn(
            "gencl:text-secondary-900 gencl:border-0",
            isTablet
              ? "gencl:text-headline-2-semi-bold!"
              : "gencl:text-body-0-semi-bold",
          )}
        >
          Playback Speed
        </DialogHeader>
        <p className="gencl:text-headline-4-semi-bold gencl:text-secondary-900">
          {playbackSpeed.speed}x
        </p>
        <PlaybackSpeedControlSlider />
      </DialogContent>
    </Dialog>
  );
}
