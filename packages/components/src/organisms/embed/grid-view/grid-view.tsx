import { useEmbedContext } from "@genuin/components/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useEmbedManagerContext } from "../context";
import { useEffect, useState, ComponentProps, useMemo } from "react";
import { cn, getAspectRatio } from "@genuin/ui/lib/utils";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { EmbedItem } from "../embed-tile-item";
import { EmbedHeader } from "@genuin/components/molecules/embed-header";

export function GridView({
  videos,
  rows = 2,
  cols = 2,
  autoAdjust,
  aspectRatio,
  totalVideos,
  ...restProps
}: {
  videos: PostDetailsType[];
  rows?: number;
  cols?: number;
  autoAdjust?: boolean;
  aspectRatio?: string;
  totalVideos: number;
} & ComponentProps<"div">) {
  const { embedEventBus } = useEmbedContext();
  const { swiper } = useEmbedManagerContext();
  const { containerHeight, containerWidth, headerHeight } =
    useEmbedDimensions();

  const { width: widthRatio, height: heightRatio } = useMemo(
    () => getAspectRatio(aspectRatio),
    [aspectRatio]
  );

  // Memoize sorted and limited videos
  const sortedAndLimitedVideos = useMemo(() => {
    return videos
      .sort((a, b) => {
        const posA = a.section?.position ?? Infinity;
        const posB = b.section?.position ?? Infinity;
        return posA - posB;
      })
      .slice(0, rows * cols);
  }, [videos, rows, cols]);

  return (
    <div
      style={{
        height: Math.max(containerHeight, 0),
        width: Math.max(containerWidth, 0),
      }}
      className="gencl:h-full gencl:w-full"
      {...restProps}
    >
      <EmbedHeader
        style={{
          height: headerHeight,
        }}
        variant="grid"
      />
      <div
        className={cn("gencl:w-full gencl:gap-2")}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {sortedAndLimitedVideos.map((videoData, index) => (
          <div
            key={index}
            className={cn(
              "gencl:relative gencl:overflow-hidden gencl:rounded-md",
              "gencl:transition-all gencl:duration-300 gencl:ease-in-out",
              "gencl:cursor-pointer"
            )}
            style={{
              aspectRatio: `${widthRatio} / ${heightRatio}`,
            }}
            onClick={() => {
              embedEventBus.emit(
                "activePlayerTypeChange",
                {},
                {
                  activePlayerType: "expand-view",
                  activeIndex: index,
                }
              );
            }}
          >
            <EmbedItem
              totalVideos={totalVideos}
              swiper={swiper}
              index={index}
              postDetails={videoData}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
