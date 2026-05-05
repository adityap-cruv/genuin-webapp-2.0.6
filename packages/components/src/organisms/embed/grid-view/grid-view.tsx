import { cn, getAspectRatio } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef } from "react";

import { useEmbedContext } from "@genuin/components/context";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import { EmbedHeader } from "@genuin/components/molecules/embed-header";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { useEmbedManagerContext } from "../context";
import { EmbedItem } from "../embed-tile-item";

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
  const { embedEventBus, rootElement } = useEmbedContext();
  const { swiper } = useEmbedManagerContext();
  const { containerHeight, containerWidth, headerHeight } = useEmbedDimensions();

  /** Ref to the inner grid div so we can measure its rendered height. */
  const gridDivRef = useRef<HTMLDivElement>(null);

  // Observe the inner grid div's rendered height and emit a RESIZE SDK event
  // so the host container can grow to fit the grid without a fixed height.
  useEffect(() => {
    const gridEl = gridDivRef.current;
    if (!gridEl) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const gridHeight = entry.contentRect.height;
      const totalHeight = headerHeight + gridHeight;

      SDKEventEmitter.emit(
        SDKEventName.RESIZE,
        {
          height: totalHeight,
          width: Math.max(containerWidth, 0),
          containerId: rootElement?.id ?? null,
        },
        { debounceTime: 100 }
      );
    });

    observer.observe(gridEl);
    return () => observer.disconnect();
  }, [headerHeight, containerWidth, rootElement]);

  const { width: widthRatio, height: heightRatio } = useMemo(() => getAspectRatio(aspectRatio), [aspectRatio]);

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
        width: Math.max(containerWidth, 0),
      }}
      className="gencl:w-full"
      {...restProps}>
      <EmbedHeader
        style={{
          height: headerHeight,
        }}
        variant="grid"
      />
      <div
        ref={gridDivRef}
        className={cn("gencl:w-full gencl:gap-2")}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}>
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
            }}>
            <EmbedItem
              totalVideos={totalVideos}
              swiper={swiper}
              index={index}
              postDetails={videoData}
              itemSize={{
                height: containerHeight / rows - 8, // Subtracting gap
                width: containerWidth / cols - 8, // Subtracting gap
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
