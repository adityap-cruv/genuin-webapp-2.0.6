"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import type { DynamicLinkoutsProps } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";

import { BREAKPOINTS } from "./layouts/registry";
import { pickBreakpoint } from "./pick-breakpoint";
import { Slot } from "./slot";
import type { Breakpoint, Layout, Slot as SlotShape, SlotKind } from "./types";
import { useContainerWidth } from "./use-container-width";

export interface HierarchicalGridProps {
  /** Override the breakpoint picker (testing / Storybook presets). When
   *  set, the template uses this width instead of measuring its host. */
  forcedWidth?: number;
  /** Initial width used to pick a breakpoint **before** the
   *  ResizeObserver fires. Eliminates the blank first paint and keeps
   *  SSR output deterministic. After mount the live measurement may
   *  swap the layout once if the host crosses a breakpoint boundary. */
  defaultWidth?: number;
  /** Override the sticky offset for `floater: true` slots — exposed
   *  as the `--hg-floater-top` CSS variable. Defaults to 44 px. */
  floaterTop?: number;
  /** Override the registry (testing). Defaults to the bundled registry. */
  breakpoints?: Breakpoint[];
  /** Per-slot data adapter — receives the slot + resolved kind,
   *  returns the props the bridge forwards to `<DynamicLinkouts>`. */
  resolveSlotProps: (slot: SlotShape, kind: SlotKind) => DynamicLinkoutsProps;
  /** Optional render-prop for the element that sits behind the
   *  linkouts overlay in `kind="video"` cells. Storybook passes a
   *  poster image (`<StoryVideoBackdrop>`); production passes a real
   *  `<VideoPlayer>`. Returning `undefined` falls back to a neutral
   *  black surface.
   *
   *  `cellIndex` is the 0-based index of the cell within its slot —
   *  always `0` for single-cell slots, `0..(cols-1)` for carousels,
   *  `0..(cols*rows-1)` for sub-grids. Lets the consumer pick a
   *  different video per cell so multiple cells in the same slot
   *  don't render identical playback. */
  renderVideoBackdrop?: (slot: SlotShape, cellIndex: number) => ReactNode;
}

/**
 * Hierarchical Grid template. Picks one of the registered breakpoint
 * layouts based on the host element's measured width and renders the
 * layout's slots — each slot delegates to either the video bridge
 * (`<DynamicLinkouts view="embed">`) or the linkout bridge
 * (`<DynamicLinkouts view="responsive">`).
 *
 * See HIERARCHICAL_GRID_PLAN.md § 6.
 */
export function HierarchicalGrid({
  forcedWidth,
  defaultWidth = 0,
  floaterTop = 44,
  breakpoints = BREAKPOINTS,
  resolveSlotProps,
  renderVideoBackdrop,
}: HierarchicalGridProps) {
  const { ref: hostRef, width: hostWidth } = useContainerWidth<HTMLDivElement>(defaultWidth);
  const width = forcedWidth ?? hostWidth;
  const layout = useLayout(width, breakpoints);

  // Build the column / row track strings once per resolved layout. With
  // `colWidths` / `rowHeights` we use explicit pixel tracks (the Figma
  // reference numbers); without them we fall back to even-share columns
  // and auto rows.
  const colTracks = layout?.colWidths?.length
    ? layout.colWidths.map((w) => `${w}px`).join(" ")
    : layout
      ? `repeat(${layout.columns}, 1fr)`
      : undefined;
  const rowTracks = layout?.rowHeights?.length ? layout.rowHeights.map((h) => `${h}px`).join(" ") : "auto";

  const style: CSSProperties = {
    display: "grid",
    gridTemplateColumns: colTracks,
    gridTemplateRows: rowTracks,
    columnGap: layout?.colGap ?? 12,
    rowGap: layout?.rowGap ?? 12,
    width: layout?.pageWidth ? `${layout.pageWidth}px` : undefined,
    margin: "0 auto",
    // Floater offset for `floater: true` slots. Slots read this via
    // `top: var(--hg-floater-top, 44px)`.
    "--hg-floater-top": `${floaterTop}px`,
  } as CSSProperties;

  return (
    <div
      ref={hostRef}
      data-slot="hierarchical-grid"
      {...(layout ? { "data-breakpoint": layout.width } : {})}
      style={style}>
      {layout?.slots.map((slot) => (
        <Slot key={slot.id} slot={slot} resolveSlotProps={resolveSlotProps} renderVideoBackdrop={renderVideoBackdrop} />
      ))}
    </div>
  );
}

/**
 * Picks the active breakpoint and returns its layout. The breakpoint
 * is computed from `width`; when the resolved breakpoint hasn't
 * changed, no setState fires (tracked via `bpRef`). All layouts
 * currently load synchronously — see HIERARCHICAL_GRID_PLAN.md § 4
 * for the rationale.
 */
function useLayout(width: number, registry: Breakpoint[]): Layout | undefined {
  const bpRef = useRef<Breakpoint | null>(null);
  const [layout, setLayout] = useState<Layout | undefined>(() => {
    const bp = pickBreakpoint(width, registry);
    bpRef.current = bp;
    return bp.load();
  });

  useEffect(() => {
    const bp = pickBreakpoint(width, registry);
    // Skip when the active breakpoint hasn't changed — avoids a
    // setState round-trip on every pixel of host resize within the
    // same bucket.
    if (bp === bpRef.current) return;
    bpRef.current = bp;
    setLayout(bp.load());
  }, [width, registry]);

  return layout;
}
