import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * A single label/value pair rendered as a `<dt>` / `<dd>` couple inside
 * the {@link MetaList} definition list.
 */
export interface MetaListItem {
  /** Left-aligned label (rendered as `<dt>`). */
  label: string;
  /** Right-aligned value (rendered as `<dd>`). */
  value: string;
}

/**
 * Visual style of the connector that fills the space between the label
 * and the value on each row. `'none'` collapses the connector column
 * entirely and lets the value snap up next to the label.
 */
export type MetaListLeader = "dotted" | "dashed" | "solid" | "none";

/**
 * Tailwind utility map for {@link MetaListLeader}. The leader is a 1 px
 * horizontal rule rendered via `border-bottom` so the line aligns with
 * the baseline of the label/value text on the same row.
 */
const LEADER_BORDER_CLASS: Record<MetaListLeader, string> = {
  dotted: "gencl:border-b gencl:border-dotted gencl:border-secondary-300",
  dashed: "gencl:border-b gencl:border-dashed gencl:border-secondary-300",
  solid: "gencl:border-b gencl:border-solid gencl:border-secondary-300",
  none: "",
};

/**
 * Props for {@link MetaList}.
 */
export interface MetaListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Definition-list rows. Each item renders as a label/value pair. */
  items: MetaListItem[];
  /**
   * Visual style of the leader line drawn between the label and value
   * on each row. Defaults to `'dotted'` — the canonical "key · ··· · value"
   * meta-panel pattern.
   */
  leader?: MetaListLeader;
}

/**
 * Key-value metadata definition list — renders as a `<dl>` with one
 * row per `item`. The middle column is a horizontal rule (the leader)
 * that auto-fills the space between the label and the value.
 *
 * Use for right-rail meta panels (e.g. "Placement Styles: Carousel, Grid"
 * blocks), product spec lists, or any "label …… value" data display.
 *
 * The component is presentational: no `'use client'`, no tone / color
 * knob beyond the leader style. Color follows ambient text color so
 * the meta list inherits the surrounding theme.
 */
export const MetaList = React.forwardRef<HTMLDListElement, MetaListProps>(function MetaList(
  { items, leader = "dotted", className, ...props },
  ref
) {
  const leaderCls = LEADER_BORDER_CLASS[leader];
  return (
    <dl
      ref={ref}
      data-slot="meta-list"
      data-leader={leader}
      className={cn("gencl:flex gencl:flex-col gencl:gap-2", className)}
      {...props}>
      {items.map((item, idx) => (
        // `role="presentation"` strips the grid row from the AT tree so
        // the `<dl>` semantics (label/value pairs) come through cleanly.
        <div
          // The label is the natural key — falls back to the row index
          // when callers pass duplicate labels (allowed but rare).
          key={`${item.label}-${idx}`}
          role="presentation"
          className="gencl:grid gencl:grid-cols-[auto_1fr_auto] gencl:items-end gencl:gap-2">
          <dt className="gencl:text-body-1-medium gencl:text-secondary-700">{item.label}</dt>
          <span aria-hidden="true" className={cn("gencl:h-px gencl:mb-1 gencl:translate-y-px", leaderCls)} />
          <dd className="gencl:text-body-1-semi-bold gencl:text-secondary-900 gencl:m-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
});
