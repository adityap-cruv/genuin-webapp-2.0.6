"use client";

import { cn } from "@genuin/ui/lib/utils";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

import { EventBus } from "./event-bus";
import type { EventRecord } from "./event-queue";
import { EventSurfaceProvider, PanelIdProvider } from "./event-surface-context";
import styles from "./event-surface.module.css";
import type {
  EventSurfaceEventMap,
  EventSurfacePanelProps,
  EventSurfaceProps,
  GridTracks,
} from "./event-surface.types";

/**
 * DS space token -> px. Gaps go through inline style rather than Tailwind
 * classes because the surface also accepts raw pixel numbers, and Tailwind v4
 * cannot generate a class for a value only known at runtime.
 */
const GAP_PX: Record<string, number> = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  ml: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
};

function toGapValue(gap: EventSurfaceProps["gap"]): string | undefined {
  if (gap === undefined) return undefined;
  if (typeof gap === "number") return `${gap}px`;
  return `${GAP_PX[gap] ?? 0}px`;
}

function toLength(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * `minmax(0, 1fr)` rather than plain `1fr`: a grid track's default minimum is
 * `auto`, so one overflowing child (a long title, a wide video) would push the
 * track — and the whole surface — past its container width.
 */
function toTracks(tracks: GridTracks | undefined): string | undefined {
  if (tracks === undefined) return undefined;
  if (typeof tracks === "number") {
    const count = Math.max(1, Math.floor(tracks));
    return `repeat(${count}, minmax(0, 1fr))`;
  }
  return tracks;
}

/**
 * Event-driven container that renders N arbitrary children and lets them
 * coordinate without knowing about each other.
 *
 * The surface owns one {@link EventBus} per mount (never a module singleton, so
 * two surfaces on a page stay isolated). Any descendant emits through
 * `useEmit()`; any descendant reacts through `useSurfaceEvent()` or reads
 * current state through `useLatestEvent()`. Because every emit is tagged with
 * its origin panel and duplicate payloads are dropped, two panels can drive each
 * other in both directions without ping-ponging — a video panel broadcasting the
 * running video while an article panel broadcasts user selections back.
 *
 * Layout is a plain CSS grid sized by `width` / `height` / `columns` / `rows`,
 * so the same component covers a two-pane split and an N-tile grid.
 *
 * @example
 * ```tsx
 * <EventSurface width="100%" height={440} columns="2fr 1fr" gap="lg">
 *   <EventSurfacePanel id="video">
 *     <VideoPane />
 *   </EventSurfacePanel>
 *   <EventSurfacePanel id="articles">
 *     <ArticlePane />
 *   </EventSurfacePanel>
 * </EventSurface>
 * ```
 */
export function EventSurface({
  children,
  width = "100%",
  height = "100%",
  columns = 1,
  rows,
  gap,
  columnGap,
  rowGap,
  autoFlow,
  areas,
  queueCapacity,
  suppressDuplicates,
  onCapture,
  ariaLabel,
  className,
  style,
  ...restProps
}: EventSurfaceProps) {
  // One bus for the lifetime of this mount. Created lazily via a ref rather than
  // useMemo — useMemo is a performance hint React may discard, and a recreated
  // bus would silently drop every existing subscription.
  const busRef = useRef<EventBus<EventSurfaceEventMap> | null>(null);
  if (busRef.current === null) {
    busRef.current = new EventBus<EventSurfaceEventMap>({
      capacity: queueCapacity,
      suppressDuplicates,
    });
  }
  const bus = busRef.current;

  const onCaptureRef = useRef(onCapture);
  onCaptureRef.current = onCapture;

  useEffect(() => {
    if (!onCaptureRef.current) return;
    return bus.onAny((record: EventRecord<string, unknown>) => {
      onCaptureRef.current?.(
        record.type as keyof EventSurfaceEventMap & string,
        record.payload as never,
        record.sourceId
      );
    });
  }, [bus]);

  const gridStyle = useMemo<CSSProperties>(() => {
    return {
      width: toLength(width),
      height: toLength(height),
      gridTemplateColumns: toTracks(columns),
      gridTemplateRows: toTracks(rows),
      gridTemplateAreas: areas,
      gridAutoFlow: autoFlow,
      gap: toGapValue(gap),
      columnGap: toGapValue(columnGap),
      rowGap: toGapValue(rowGap),
      ...style,
    };
  }, [width, height, columns, rows, areas, autoFlow, gap, columnGap, rowGap, style]);

  return (
    <EventSurfaceProvider value={bus}>
      <div
        data-slot="event-surface"
        aria-label={ariaLabel}
        className={cn(styles.surface, className)}
        style={gridStyle}
        {...restProps}>
        {children}
      </div>
    </EventSurfaceProvider>
  );
}

/**
 * A grid cell within an {@link EventSurface} that gives its subtree an identity
 * on the bus.
 *
 * The `id` becomes the `sourceId` of everything emitted inside this panel, which
 * is what lets the bus skip delivering a panel its own broadcasts. Ids must be
 * unique within a surface — two panels sharing one would swallow each other's
 * events.
 */
export function EventSurfacePanel({
  id,
  colSpan,
  rowSpan,
  area,
  colStart,
  rowStart,
  className,
  style,
  children,
  ...restProps
}: EventSurfacePanelProps) {
  const panelStyle = useMemo<CSSProperties>(() => {
    return {
      gridArea: area,
      gridColumn: area
        ? undefined
        : colStart !== undefined
          ? `${colStart} / span ${colSpan ?? 1}`
          : colSpan !== undefined
            ? `span ${colSpan} / span ${colSpan}`
            : undefined,
      gridRow: area
        ? undefined
        : rowStart !== undefined
          ? `${rowStart} / span ${rowSpan ?? 1}`
          : rowSpan !== undefined
            ? `span ${rowSpan} / span ${rowSpan}`
            : undefined,
      ...style,
    };
  }, [area, colSpan, colStart, rowSpan, rowStart, style]);

  return (
    <PanelIdProvider value={id}>
      <div
        data-slot="event-surface-panel"
        data-panel-id={id}
        className={cn(styles.panel, className)}
        style={panelStyle}
        {...restProps}>
        {children}
      </div>
    </PanelIdProvider>
  );
}
