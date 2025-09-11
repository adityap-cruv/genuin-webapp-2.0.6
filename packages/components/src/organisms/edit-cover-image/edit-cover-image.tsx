"use client";
import * as React from "react";
import { cn } from "@genuin/ui/lib/utils";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { loadVideoMetadata } from "@genuin/components/molecules/video-trim-slider/utils";

// Public methods exposed to parent via ref
export type EditCoverImageHandle = {
  captureImage: () => Promise<File | null>;
  downloadImage: (url: string, fileName?: string) => void;
};

type EditCoverImageProps = {
  videoURL: string;
  thumbHeight: number;
};

export const EditCoverImage = React.forwardRef<
  EditCoverImageHandle,
  EditCoverImageProps
>(function EditCoverImage({ videoURL, thumbHeight }, ref) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const overlayImageRef = React.useRef<HTMLImageElement | null>(null);

  const [thumbnails, setThumbnails] = React.useState<string[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [leftPosition, setLeftPosition] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  // Generate thumbnails by seeking video and capturing frames
  const generateThumbnails = React.useCallback(
    async (count: number, targetWidth: number, targetHeight: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      const metadata = await loadVideoMetadata(videoURL);

      if (
        !video ||
        !canvas ||
        !context ||
        !count ||
        isNaN(metadata?.duration)
      ) {
        setIsLoadingThumbnails(false);
        return;
      }

      setIsLoadingThumbnails(true);
      setThumbnails(Array(count).fill(""));

      const { videoWidth, videoHeight } = video;
      const videoAspect = videoWidth / videoHeight;
      const targetAspect = targetWidth / targetHeight;
      // Calculate cropping for correct aspect ratio
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

      // Setup canvas dimensions
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Function to seek and capture frame
      const captureFrame = () => {
        context.clearRect(0, 0, targetWidth, targetHeight);
        context.drawImage(
          video,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );
        return canvas.toDataURL("image/png", 0.6);
      };

      const interval = metadata.duration / (count - 1);

      for (let i = 0; i < count; i++) {
        const time = interval * i;
        video.currentTime = Math.min(time, metadata.duration);

        // Wait until seek finishes
        await new Promise((resolve) =>
          video.addEventListener("seeked", resolve, { once: true })
        );

        const thumb = captureFrame();
        setThumbnails((prev) => {
          const updated = [...prev];
          updated[i] = thumb;
          return updated;
        });
      }

      setIsLoadingThumbnails(false);
    },
    []
  );

  // Track container resize to calculate number of thumbnails
  React.useEffect(() => {
    if (!parentRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate thumbnails when video loads and container size is ready
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !containerWidth) return;

    const onLoaded = () => {
      const thumbWidth = Math.round((thumbHeight * 9) / 16);
      const count = Math.max(1, Math.floor(containerWidth / thumbWidth));

      // Call generator with fixed resolution for quality
      generateThumbnails(count, 405, 720);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [containerWidth, generateThumbnails, thumbHeight]);

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  // Handle dragging for thumbnail selector overlay
  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragging || !parentRef.current || thumbnails.length === 0) return;

      const parentRect = parentRef.current.getBoundingClientRect();
      const containerWidth = parentRef.current.offsetWidth;
      const overlayWidthPercent = 120 / thumbnails.length;
      const overlayPixelWidth = (containerWidth * overlayWidthPercent) / 100;

      let newLeft = e.clientX - parentRect.left;

      // Clamp within bounds
      const maxLeft = containerWidth - overlayPixelWidth / 2;
      const minLeft = 0 - overlayPixelWidth / 2;
      newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));

      // Snap overlay to thumbnail index
      const clampedLeft = Math.max(
        0,
        Math.min(newLeft, containerWidth - overlayPixelWidth)
      );
      setLeftPosition(clampedLeft);

      const centerX = clampedLeft + overlayPixelWidth / 2;
      const index = Math.floor((centerX / containerWidth) * thumbnails.length);

      const newSrc = thumbnails[index];
      if (overlayImageRef.current && newSrc) {
        overlayImageRef.current.src = newSrc;
      }
    },
    [dragging, thumbnails]
  );

  // Stop dragging on mouse up
  const handleMouseUp = React.useCallback(() => {
    setDragging(false);
  }, []);

  // Attach and clean up global mouse events
  React.useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Convert overlay image to File
  const getOverlayImageFile = async (): Promise<File | null> => {
    const img = overlayImageRef.current;
    const canvas = overlayCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!img || !canvas || !context) return null;

    const width = img.naturalWidth;
    const height = img.naturalHeight;
    canvas.width = width;
    canvas.height = height;
    context.drawImage(img, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], "cover_frame.png", { type: "image/png" }));
        } else {
          resolve(null);
        }
      }, "image/png");
    });
  };

  // Download image by URL (This code use only for the testing purpose)
  const downloadImageFromURL = async (
    imageUrl: string,
    fileName = `thumbnail.png`
  ) => {
    try {
      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const file = new File([blob], fileName, {
        type: blob.type || "image/png",
      });

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up URL
    } catch (error) {
      console.error("Image download failed:", error);
    }
  };

  // Expose public methods to parent
  React.useImperativeHandle(ref, () => ({
    captureImage: getOverlayImageFile,
    downloadImage: downloadImageFromURL,
  }));

  return (
    <div className="gencl:space-y-4">
      {/* Hidden elements for video and canvases */}
      <video
        ref={videoRef}
        src={videoURL}
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <canvas ref={overlayCanvasRef} style={{ display: "none" }} />

      {/* Main container for thumbnail strip and selector overlay */}
      <div
        ref={parentRef}
        className="gencl:relative gencl:w-full"
        style={{ userSelect: "none", height: `${thumbHeight}px` }}
      >
        {/* Thumbnails row */}
        <div className="gencl:flex gencl:overflow-hidden gencl:rounded-lg gencl:w-full gencl:cursor-pointer">
          {thumbnails.map((src, index) => (
            <div
              key={index}
              className="gencl:shrink-0"
              style={{
                width: `${100 / thumbnails.length}%`,
                height: `${thumbHeight}px`,
              }}
              onClick={() => {
                setSelectedIndex(index);

                // Position overlay correctly
                if (parentRef.current) {
                  const containerWidth = parentRef.current.offsetWidth;
                  const overlayPixelWidth =
                    (containerWidth * (120 / thumbnails.length)) / 100;
                  const newLeft =
                    (index / thumbnails.length) * containerWidth -
                    overlayPixelWidth / 2;

                  setLeftPosition(
                    Math.max(
                      0,
                      Math.min(newLeft, containerWidth - overlayPixelWidth)
                    )
                  );
                }
              }}
            >
              {src ? (
                <img
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  className="gencl:w-full gencl:h-full gencl:object-cover"
                />
              ) : (
                <Skeleton className="gencl:w-full gencl:h-full" />
              )}
            </div>
          ))}
        </div>

        {/* Draggable overlay selector with live preview or loading skeleton */}
        {selectedIndex !== null && (
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "gencl:absolute gencl:cursor-pointer gencl:rounded-lg gencl:border-2 gencl:border-white gencl:cursor-pointer gencl:overflow-hidden"
            )}
            style={{
              width: isLoadingThumbnails
                ? "100%"
                : `${120 / thumbnails.length}%`,
              height: `${thumbHeight + 16}px`,
              left: leftPosition,
              top: -8,
            }}
          >
            {isLoadingThumbnails ? (
              <Skeleton className="gencl:size-36 gencl:shrink-0 gencl:rounded-md gencl:w-full" />
            ) : (
              <img
                ref={overlayImageRef}
                src={thumbnails[0] || ""}
                alt="Current thumbnail"
                className="gencl:w-full gencl:h-full gencl:object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});
