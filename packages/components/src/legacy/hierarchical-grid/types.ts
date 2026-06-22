/**
 * Hierarchical Grid — types.
 *
 * Mirror of the reference JSON shapes in `Downloads/genuin/grid/layouts/*.json`.
 * Kept 1:1 so the Figma → code port stays a copy-paste; the only difference
 * is that we encode layouts as TS modules (typed, lazy-loaded) instead of
 * JSON.
 *
 * See HIERARCHICAL_GRID_PLAN.md § 4.
 */

export type SlotKind = "video" | "linkout" | "ai-response";

export interface Slot {
  /** Stable `${rowLetter}${col}` ID — A1, B2, etc. Used as React key + debug. */
  id: string;
  /** 1-indexed grid coordinates (CSS grid lines). */
  row: number;
  col: number;
  colSpan?: number;
  rowSpan?: number;
  /** Human-readable slot name from the Figma reference. The slot kind
   *  picker reads this — anything containing "video" routes to the
   *  video bridge, everything else to the linkout bridge. */
  name: string;
  /** Reference dimensions from the Figma layout. Not authoritative —
   *  the cell measures itself via ResizeObserver. Kept for debugging
   *  and dev overlays. */
  w: number;
  h: number;
  /** Sub-grid: render `cols × rows` independent sub-cells inside the
   *  slot. Each sub-cell renders its own <SlotContent>. (Phase 2.) */
  grid?: boolean;
  /** Horizontal carousel of `cols` sub-cells. Same content semantics
   *  as `grid`, different layout. (Phase 2.) */
  carousel?: boolean;
  cols?: number;
  rows?: number;
  /** Sticky / "floater" behavior — the slot pins to a top offset
   *  (template's `--hg-floater-top`) and scrolls with the page until
   *  its row scrolls past. (Phase 3.) */
  floater?: boolean;
}

export interface Layout {
  width: number;
  columns: number;
  pageWidth?: number;
  /** Used as `grid-template-columns: <px> <px> …` when set. Otherwise
   *  falls back to `repeat(columns, 1fr)`. */
  colWidths?: number[];
  /** Used as `grid-template-rows: <px> <px> …` when set. Otherwise
   *  defaults to `auto`. */
  rowHeights?: number[];
  colGap?: number;
  rowGap?: number;
  slots: Slot[];
}

export interface Breakpoint {
  minWidth: number;
  /** Returns the layout synchronously. The function indirection is
   *  kept so consumers can build registries lazily from layout
   *  factories or per-tenant overrides — but `useLayout` does not
   *  await; layouts must resolve in one tick. */
  load: () => Layout;
}
