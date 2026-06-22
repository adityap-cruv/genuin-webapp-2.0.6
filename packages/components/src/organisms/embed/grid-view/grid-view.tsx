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

import { computeTileSize, ratioToAspect, resolveGridDimensions } from "./grid-layout";

export function GridView({
  videos,
  rows = 2,
  cols = 2,
  autoAdjust,
  aspectRatio,
  totalVideos,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  ...restProps
}: {
  videos: PostDetailsType[];
  rows?: number;
  cols?: number;
  autoAdjust?: boolean;
  aspectRatio?: string;
  totalVideos: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
} & ComponentProps<"div">) {
  const { embedEventBus, rootElement } = useEmbedContext();
  const { swiper } = useEmbedManagerContext();
  const { containerHeight, containerWidth, headerHeight } = useEmbedDimensions();

  /** Ref to the inner grid div so we can measure its rendered height. */
  const gridDivRef = useRef<HTMLDivElement>(null);
  /** Ref to the scroll-end sentinel used to drive pagination in dynamic mode. */
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { width: widthRatio, height: heightRatio } = useMemo(() => getAspectRatio(aspectRatio), [aspectRatio]);

  // Resolve effective mode + dimensions from the backend config and the current
  // (possibly paginated) video count.
  const { mode, rows: effectiveRows, cols: effectiveCols } = useMemo(
    () => resolveGridDimensions(rows, cols, videos.length),
    [rows, cols, videos.length]
  );

  // Observe the inner grid div's rendered height and emit a RESIZE SDK event.
  //
  // - fixed mode: the host grows to fit the whole grid (original behavior).
  // - dynamic-rows: the host MUST stay capped at the container height so the
  //   extra rows overflow and scroll INSIDE the container. Emitting the full
  //   content height here would grow the host to fit everything, so there would
  //   never be any overflow to scroll. We emit the (capped) container height.
  // - dynamic-cols: height is bounded by the fixed row count; emit that.
  useEffect(() => {
    const gridEl = gridDivRef.current;
    if (!gridEl) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const gridHeight = entry.contentRect.height;
      const totalHeight =
        mode === "fixed" ? headerHeight + gridHeight : Math.max(containerHeight, 0);

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
  }, [mode, headerHeight, containerHeight, containerWidth, rootElement]);

  // Memoize sorted videos. In fixed mode we cap at capacity (existing behavior);
  // in dynamic mode every loaded video is rendered.
  const sortedVideos = useMemo(() => {
    const sorted = [...videos].sort((a, b) => {
      const posA = a.section?.position ?? Infinity;
      const posB = b.section?.position ?? Infinity;
      return posA - posB;
    });
    return mode === "fixed" ? sorted.slice(0, effectiveRows * effectiveCols) : sorted;
  }, [videos, mode, effectiveRows, effectiveCols]);

  // Watch the scroll-end sentinel to drive pagination. Grid has no Swiper, so
  // this replaces the swiper-progress trigger used by other layouts. Works for
  // both vertical (dynamic rows) and horizontal (dynamic cols) scrolling.
  useEffect(() => {
    if (mode === "fixed") return;
    const sentinel = sentinelRef.current;
    if (!sentinel || !fetchNextPage) return;

    // Prefetch margin on the scroll axis: bottom for vertical, right for
    // horizontal. (top right bottom left)
    const rootMargin = mode === "dynamic-cols" ? "0px 300px 0px 0px" : "0px 0px 300px 0px";

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: gridDivRef.current?.parentElement ?? null, rootMargin }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mode, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Tile sizing — the FIXED axis drives the tile size; the dynamic axis is sized
  // from the aspect ratio so tiles stay a CONSTANT size as more videos load and
  // the dynamic axis grows + scrolls.
  //
  // - dynamic-rows: cols are fixed → width = containerW / cols. Height follows
  //   the aspect ratio. Rows grow downward.
  // - dynamic-cols: rows are fixed → height = containerH / rows. Width follows
  //   the aspect ratio (NOT containerW / cols, which would shrink every tile as
  //   the column count grows). Columns grow rightward.
  // - fixed: both from the container (original behavior).
  const aspect = ratioToAspect(widthRatio, heightRatio);
  const usableHeight = Math.max(containerHeight - headerHeight, 0);

  const { tileWidth, tileHeight } = useMemo(
    () =>
      computeTileSize({
        mode,
        rows: effectiveRows,
        cols: effectiveCols,
        containerWidth,
        usableHeight,
        aspect,
      }),
    [mode, effectiveRows, effectiveCols, containerWidth, usableHeight, aspect]
  );

  // Grid template + scroll behavior per mode.
  const gridStyle = useMemo<React.CSSProperties>(() => {
    if (mode === "dynamic-rows") {
      // Columns fixed, rows flow downward and scroll vertically.
      return {
        display: "grid",
        gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
        gridAutoRows: "max-content",
      };
    }
    if (mode === "dynamic-cols") {
      // Rows fixed, columns flow rightward and scroll horizontally. Each column
      // is a constant width derived from the row height and aspect ratio.
      return {
        display: "grid",
        gridTemplateRows: `repeat(${effectiveRows}, 1fr)`,
        gridAutoFlow: "column",
        gridAutoColumns: `${Math.max(tileWidth, 0)}px`,
        height: "100%",
      };
    }
    // Fixed — unchanged from the original implementation.
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
      gridTemplateRows: `repeat(${effectiveRows}, 1fr)`,
    };
  }, [mode, effectiveRows, effectiveCols, tileWidth]);

  // Per-cell sizing. In fixed mode the cell keeps its aspect-ratio box (original
  // behavior). In dynamic modes the grid tracks already define the cell box, so
  // we size the cell explicitly to keep tiles a constant size as the grid grows.
  const cellStyle: React.CSSProperties =
    mode === "fixed"
      ? { aspectRatio: `${widthRatio} / ${heightRatio}` }
      : { width: Math.max(tileWidth, 0), height: Math.max(tileHeight, 0) };

  const outerScrollClass =
    mode === "dynamic-cols"
      ? "gencl:overflow-x-auto gencl:overflow-y-hidden"
      : mode === "dynamic-rows"
        ? "gencl:overflow-y-auto"
        : "";

  // In dynamic mode the scroll wrapper must have a bounded height for
  // overflow:auto to engage. Cap it at the container height minus the header so
  // extra rows/cols scroll inside the container instead of growing the host.
  const scrollWrapperStyle: React.CSSProperties =
    mode === "fixed"
      ? {}
      : { height: Math.max(containerHeight - headerHeight, 0) };

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
      <div className={cn("gencl:w-full", outerScrollClass)} style={scrollWrapperStyle}>
        <div ref={gridDivRef} className={cn("gencl:w-full gencl:gap-2")} style={gridStyle}>
          {sortedVideos.map((videoData, index) => (
            <div
              key={index}
              className={cn(
                "gencl:relative gencl:overflow-hidden gencl:rounded-md",
                "gencl:transition-all gencl:duration-300 gencl:ease-in-out",
                "gencl:cursor-pointer"
              )}
              style={cellStyle}
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
                  height: tileHeight,
                  width: tileWidth,
                }}
              />
            </div>
          ))}
          {/* Scroll-end sentinel — drives pagination in dynamic mode only.
              It needs a real size on the scroll axis so the IntersectionObserver
              can detect it; a zero-size element in a column-flow grid never
              intersects. */}
          {mode === "dynamic-cols" && (
            <div ref={sentinelRef} aria-hidden style={{ gridRow: "1 / -1", width: 1, height: "100%" }} />
          )}
          {mode === "dynamic-rows" && (
            <div ref={sentinelRef} aria-hidden style={{ gridColumn: "1 / -1", height: 1, width: "100%" }} />
          )}
        </div>
      </div>
    </div>
  );
}
