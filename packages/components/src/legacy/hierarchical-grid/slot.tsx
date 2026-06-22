"use client";

import type { CSSProperties, ReactNode } from "react";

import type { DynamicLinkoutsProps } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";

import { IsolatedSheetContext } from "./isolated-sheet-context";
import { SlotContent } from "./slot-content";
import { slotKind } from "./slot-kind";
import type { Slot as SlotShape, SlotKind } from "./types";

export interface SlotProps {
  slot: SlotShape;
  /** Per-slot data adapter — receives the slot + resolved kind, returns
   *  the props the bridge forwards to `<DynamicLinkouts>`. The host owns
   *  fixture vs. real-data selection here; the template stays
   *  data-agnostic. */
  resolveSlotProps: (slot: SlotShape, kind: SlotKind) => DynamicLinkoutsProps;
  /** Optional render-prop for the video poster / video element rendered
   *  behind the linkouts overlay in `kind="video"` cells. Storybook
   *  passes a poster image; production passes a real `<VideoPlayer>`.
   *  No-op for `kind="linkout"` cells. `cellIndex` is forwarded so
   *  consumers can pick a different video per cell. */
  renderVideoBackdrop?: (slot: SlotShape, cellIndex: number) => ReactNode;
}

/**
 * Renders a `<SlotContent>`. For `video` and `linkout` kinds we wrap
 * in `<IsolatedSheetContext>` so each cell's `<DynamicLinkouts>`
 * gets its own event bus — without that, multiple cells fight over
 * the singleton "linkouts" content type. AI response cells skip the
 * wrapper since `<AiResponse>` doesn't read sheet state.
 */
function Cell(props: {
  kind: SlotKind;
  slot: SlotShape;
  resolveSlotProps: (slot: SlotShape, kind: SlotKind) => DynamicLinkoutsProps;
  videoBackdrop: ReactNode;
}) {
  const content = (
    <SlotContent
      kind={props.kind}
      slotProps={props.resolveSlotProps(props.slot, props.kind)}
      videoBackdrop={props.videoBackdrop}
    />
  );
  if (props.kind === "ai-response") return content;
  return <IsolatedSheetContext>{content}</IsolatedSheetContext>;
}

/**
 * Slot wrapper. Places the section in the outer grid via
 * `grid-column` / `grid-row` and renders the correct content shape:
 *
 * - **Single cell:** one `<Cell>` filling the slot.
 * - **`grid: true`:** sub-grid of `cols × rows` independent cells.
 * - **`carousel: true`:** horizontal scroller of `cols` cells.
 * - **`floater: true`:** sticky position pinned to the template's
 *   `--hg-floater-top` offset.
 * - **`colSpan` / `rowSpan`:** forwarded into `grid-column` / `grid-row`.
 *
 * See HIERARCHICAL_GRID_PLAN.md § 7.
 */
export function Slot({ slot, resolveSlotProps, renderVideoBackdrop }: SlotProps) {
  const colSpan = slot.colSpan ?? 1;
  const rowSpan = slot.rowSpan ?? 1;
  const kind = slotKind(slot.name);

  const sectionStyle: CSSProperties = {
    gridColumn: `${slot.col} / span ${colSpan}`,
    gridRow: `${slot.row} / span ${rowSpan}`,
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    // Establish a per-slot stacking context so child z-indexes don't
    // escape into the grid's stacking context. Without this, the
    // dynamic-sheet's `z-50` (see `dynamic-sheet.tsx`) inside a
    // linkout cell outranks the floater slot's `z-index: 5`, and the
    // linkout content appears to float on top of a pinned floater.
    // `isolation: isolate` keeps the sheet's z-index local without
    // changing layout flow.
    isolation: "isolate",
    ...(slot.floater
      ? {
          position: "sticky",
          // Driven by the template root's `--hg-floater-top` CSS
          // variable (defaults to 44px). Consumers with a non-default
          // header height pass `floaterTop` to <HierarchicalGrid>.
          top: "var(--hg-floater-top, 44px)",
          zIndex: 5,
          alignSelf: "start",
          height: slot.h,
        }
      : null),
  };
  // `data-floater` lets cell content (e.g. a video bridge) detect
  // its enclosing sticky slot via `el.closest('[data-floater]')`
  // and react when the slot pins to the top.
  const dataFloater = slot.floater ? "true" : undefined;

  // Determine inner layout + cell count from the slot shape. Single
  // cells render in a plain wrapper; grids use a 2-D CSS grid;
  // carousels use a 1-D row.
  const cols = slot.cols ?? 1;
  const rows = slot.rows ?? 1;
  let innerStyle: CSSProperties;
  let cellCount: number;
  if (slot.grid) {
    innerStyle = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      columnGap: 8,
      rowGap: 8,
      width: "100%",
      height: "100%",
    };
    cellCount = cols * rows;
  } else if (slot.carousel) {
    innerStyle = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      columnGap: 8,
      width: "100%",
      height: "100%",
    };
    cellCount = cols;
  } else {
    innerStyle = { width: "100%", height: "100%" };
    cellCount = 1;
  }

  return (
    <section data-slot="hg-slot" data-name={slot.name} data-floater={dataFloater} style={sectionStyle}>
      <div style={innerStyle}>
        {Array.from({ length: cellCount }, (_, i) => (
          <Cell
            key={i}
            kind={kind}
            slot={slot}
            resolveSlotProps={resolveSlotProps}
            videoBackdrop={kind === "video" ? renderVideoBackdrop?.(slot, i) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
