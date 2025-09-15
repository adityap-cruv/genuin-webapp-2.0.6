"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ResizeHandle } from "./resize-handle";
import { formatTime, loadVideoMetadata } from "./utils";
import TimelineBar from "./timeline-bar";
import { useVideoThumbnails } from "@genuin/components/hooks/use-video-thumbnails";
import { Skeleton } from "@genuin/ui/components/skeleton";

const TRIM_MIN_SEC = 4;
const TRIM_MAX_SEC = 300;
const HANDLE_WIDTH_PX = 12; // Width of the trim handle in pixels
const DEFAULT_START_PERCENT = 10;
const DEFAULT_END_PERCENT = 20;

interface VideoTrimSlider {
  videoUrl: string;
  currentDuration?: number;
  trimDurationLimits?: { min: number; max: number }; // In Seconds
  ref: React.RefObject<{ start: number; end: number }>;
  onTrimmerReady: (isReady: boolean) => void;
}

export function VideoTrimSlider({
  videoUrl,
  currentDuration = 0,
  trimDurationLimits = { min: TRIM_MIN_SEC, max: TRIM_MAX_SEC },
  ref,
  onTrimmerReady,
}: VideoTrimSlider) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(200);
  const [startPercent, setStartPercent] = useState(DEFAULT_START_PERCENT);
  const [endPercent, setEndPercent] = useState(DEFAULT_END_PERCENT);
  const [dragging, setDragging] = useState<"left" | "right" | "middle" | null>(
    null
  );
  const [showTimeLabel, setShowTimeLabel] = useState<"left" | "right" | null>(
    null
  );
  const options = useMemo(() => ({ count: 10, width: 120, height: 90 }), []);
  const { videoRef, canvasRef, thumbnails, isLoading } = useVideoThumbnails({
    ...options,
    onThumbnailsReady: onTrimmerReady,
  });

  const trimDurationPercent = endPercent - startPercent;
  const trimMaxSec = trimDurationLimits.max;
  const trimMinSec = trimDurationLimits.min;

  const onTrimRangeChange = (start: number, end: number) => {
    ref.current.start = start;
    ref.current.end = end;
  };

  // Load video duration and enforce max trim range

  const videoMetadata = async (url: string) => {
    try {
      const videoMetadata = await loadVideoMetadata(url);
      const maxTrim = Math.min(videoMetadata.duration, trimMaxSec);
      setDuration(videoMetadata.duration);

      const initialEnd = (maxTrim / videoMetadata.duration) * 100;
      setEndPercent(initialEnd);
      setStartPercent(0);
      onTrimRangeChange?.(0, maxTrim);
    } catch (error) {
      console.error("Error loading video metadata:", error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      videoMetadata(videoUrl);
    }
  }, [videoUrl]);

  // useEffect(() => {
  //   const video = videoRef.current;
  //   if (video) {
  //     video.onloadedmetadata = () => {
  //       const actualDuration = video.duration;
  //       const maxTrim = Math.min(actualDuration, trimMaxSec);
  //       setDuration(actualDuration);

  //       const initialEnd = (maxTrim / actualDuration) * 100;
  //       setEndPercent(initialEnd);
  //       setStartPercent(0);
  //       onTrimRangeChange?.(0, maxTrim);
  //     };
  //   }
  // }, [videoUrl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percent = (x / width) * 100;
      const handlePercent = (HANDLE_WIDTH_PX / width) * 100;

      // Use exact minimum and maximum distance without overcompensating
      const minDistancePercent = (trimMinSec / duration) * 100;
      const maxDistancePercent = (trimMaxSec / duration) * 100;

      if (dragging === "left") {
        const adjustedPercent = Math.max(
          0,
          Math.min(percent, endPercent - minDistancePercent)
        );
        const startTime = parseFloat(
          ((adjustedPercent / 100) * duration).toFixed(1)
        );
        const endTime = parseFloat(((endPercent / 100) * duration).toFixed(1));
        if (endTime - startTime >= trimMinSec) {
          setStartPercent(adjustedPercent);
          setShowTimeLabel("left");
          onTrimRangeChange?.(startTime, endTime);
        }
      } else if (dragging === "right") {
        const adjustedPercent = Math.min(
          100,
          Math.max(percent, startPercent + minDistancePercent)
        );
        const startTime = parseFloat(
          ((startPercent / 100) * duration).toFixed(1)
        );
        const endTime = parseFloat(
          ((adjustedPercent / 100) * duration).toFixed(1)
        );
        if (endTime - startTime <= trimMaxSec) {
          setEndPercent(adjustedPercent);
          setShowTimeLabel("right");
          onTrimRangeChange?.(startTime, endTime);
        }
      } else if (dragging === "middle") {
        const deltaX = e.movementX;
        const deltaPercent = (deltaX / width) * 100;
        const newStart = Math.max(
          0,
          Math.min(startPercent + deltaPercent, 100 - trimDurationPercent)
        );
        const newEnd = newStart + trimDurationPercent;
        setStartPercent(newStart);
        setEndPercent(newEnd);
        onTrimRangeChange?.(
          parseFloat(((newStart / 100) * duration).toFixed(1)),
          parseFloat(((newEnd / 100) * duration).toFixed(1))
        );
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setShowTimeLabel(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, startPercent, endPercent, duration, onTrimRangeChange]);

  const mediaElement = (
    <>
      <video
        ref={videoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );

  if (isLoading) {
    return (
      <>
        <Skeleton className="gencl:w-full gencl:h-full" />
        {mediaElement}
      </>
    );
  }

  return (
    <div className="gencl:w-full gencl:select-none">
      {mediaElement}
      <div className="gencl:relative gencl:w-full">
        <div ref={trackRef} className="gencl:relative gencl:h-16">
          <div className="gencl:absolute gencl:top-0 gencl:left-0 gencl:w-full gencl:h-full gencl:flex gencl:rounded gencl:overflow-hidden">
            {thumbnails.map((thumbnail: string, i: number) => (
              <div
                key={i}
                className="gencl:flex-shrink-0 gencl:w-[calc(100%/10)] gencl:h-full gencl:bg-cover gencl:bg-center gencl:bg-no-repeat"
                style={{ backgroundImage: `url(${thumbnail})` }}
              />
            ))}
          </div>

          <div
            className="gencl:absolute gencl:top-0 gencl:left-0 gencl:h-full gencl:z-10"
            style={{
              width: `${startPercent + 1}%`,
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
          />
          <div
            className="gencl:absolute gencl:top-0 gencl:right-0 gencl:h-full gencl:z-10"
            style={{
              width: `${100 - endPercent + 1}%`,
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
          />

          <div
            className="gencl:absolute gencl:top-0 gencl:h-full gencl:z-20 gencl:flex gencl:items-center gencl:group gencl:cursor-grab"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
            onMouseDown={(e) => {
              const target = e.target as HTMLElement;
              if (
                target.dataset.handle !== "left" &&
                target.dataset.handle !== "right"
              ) {
                setDragging("middle");
              }
            }}
          >
            {/* Video play tracker */}
            {currentDuration > 0 && (
              <div>
                <div
                  className="gencl:h-16 gencl:bg-white gencl:w-1 gencl:rounded gencl:drop-shadow-md gencl:absolute gencl:top-0 gencl:z-500"
                  style={{ left: (currentDuration / duration) * 100 }}
                />
              </div>
            )}

            <ResizeHandle
              side="left"
              onMouseDown={(e) => {
                setDragging("left");
                setShowTimeLabel("left");
              }}
              showTimeLabel={showTimeLabel === "left"}
              timeLabel={formatTime((startPercent / 100) * duration)}
            />
            <div className="gencl:flex-grow gencl:h-full gencl:border-y-2 gencl:border-secondary-900 gencl:bg-transparent" />
            <ResizeHandle
              side="right"
              onMouseDown={(e) => {
                setDragging("right");
                setShowTimeLabel("right");
              }}
              showTimeLabel={showTimeLabel === "right"}
              timeLabel={formatTime((endPercent / 100) * duration)}
            />
          </div>

          {/* Background layer for handles */}
          <div className="gencl:absolute gencl:top-0 gencl:w-full gencl:h-full gencl:flex gencl:items-center gencl:group gencl:cursor-grab">
            <div className="gencl:w-[12px] gencl:h-full gencl:bg-secondary-900 gencl:rounded-l" />
            <div className="gencl:flex-grow gencl:h-full gencl:border-y-2 gencl:border-secondary-900" />
            <div className="gencl:w-[12px] gencl:h-full gencl:bg-secondary-900 gencl:rounded-r" />
          </div>
        </div>

        <TimelineBar duration={duration} />
      </div>
    </div>
  );
}
