"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseVideoThumbnailsProps = {
  count: number;
  width: number;
  height: number;
  onThumbnailsReady?: (isReady: boolean) => void;
};

export function useVideoThumbnails({
  count,
  width,
  height,
  onThumbnailsReady,
}: UseVideoThumbnailsProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const generateThumbnails = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!video || !canvas || !context || isNaN(video.duration)) return;

    setIsLoading(true);
    const interval = video.duration / (count + 1);
    const newThumbnails: string[] = [];

    canvas.width = width;
    canvas.height = height;

    const { videoWidth, videoHeight } = video;
    const videoAspect = videoWidth / videoHeight;
    const targetAspect = width / height;

    let sx = 0,
      sy = 0,
      sWidth = videoWidth,
      sHeight = videoHeight;

    if (videoAspect > targetAspect) {
      sWidth = videoHeight * targetAspect;
      sx = (videoWidth - sWidth) / 2;
    } else {
      sHeight = videoWidth / targetAspect;
      sy = (videoHeight - sHeight) / 2;
    }

    const seekAndCapture = (time: number): Promise<string> => {
      return new Promise((resolve) => {
        const onSeeked = () => {
          context.clearRect(0, 0, width, height);
          context.drawImage(
            video,
            sx,
            sy,
            sWidth,
            sHeight,
            0,
            0,
            width,
            height
          );
          const dataUrl = canvas.toDataURL("image/png");
          video.removeEventListener("seeked", onSeeked);
          resolve(dataUrl);
        };

        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
      });
    };

    for (let i = 1; i <= count; i++) {
      const seekTime = interval * i;
      const dataUrl = await seekAndCapture(seekTime);
      newThumbnails.push(dataUrl);
      await new Promise((r) => setTimeout(r, 30)); // delay to avoid glitches
    }

    setThumbnails(newThumbnails);
    setIsLoading(false);

    if (onThumbnailsReady) {
      onThumbnailsReady(true);
    }
  }, [count, width, height]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      // Notify that thumbnails are not ready yet
      if (onThumbnailsReady) {
        onThumbnailsReady(false);
      }

      if (video.duration === Infinity) {
        video.currentTime = Number.MAX_SAFE_INTEGER;

        const onTimeUpdate = () => {
          video.removeEventListener("timeupdate", onTimeUpdate);
          video.currentTime = 0; // Reset back to beginning
          generateThumbnails(); // Now safe to proceed
        };

        video.addEventListener("timeupdate", onTimeUpdate);
      } else {
        generateThumbnails();
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [generateThumbnails]);

  return {
    videoRef,
    canvasRef,
    thumbnails,
    isLoading,
  };
}
