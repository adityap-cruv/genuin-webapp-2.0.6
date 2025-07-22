"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
} from "@genuin/ui/dialog";
import React, { ComponentProps } from "react";
import PlaybackSpeedControlSlider from "./speed-control-buttons";
import { useFeedContext } from "@genuin/components/templates/feed/context";

type PlaybackSpeedProps = ComponentProps<typeof Dialog> & {
  children: React.ReactNode;
};

export function PlaybackSpeed({ children, ...props }: PlaybackSpeedProps) {
  const { playbackSpeed } = useFeedContext();
  return (
    <Dialog modal {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gencl:text-center gencl:bg-white gencl:sm:min-w-lg! gencl:sm:p-10! gencl:md:min-w-xl! gencl:rounded-2xl gencl:space-y-4">
        <DialogHeader className="gencl:text-secondary-900 gencl:text-body-0-semi-bold gencl:md:text-headline-2-semi-bold! gencl:border-0">
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
