import type { Layout } from "../types";

/**
 * 420 px breakpoint — single-column mobile feed.
 *
 * Ported verbatim from `Downloads/genuin/grid/layouts/420.json`.
 * Non-video slots (`Profile (List View)`, `Koah Ad`, …) renamed to
 * `Linkout - …` per HIERARCHICAL_GRID_PLAN.md § 5 so the kind picker
 * routes them to the responsive bridge.
 */
export const layout420: Layout = {
  width: 420,
  columns: 1,
  pageWidth: 414,
  colWidths: [377],
  rowHeights: [43, 678, 95, 446, 95, 678, 399, 95, 678, 95, 386, 95, 678, 411, 246, 678, 95, 386, 95, 678],
  colGap: 0,
  rowGap: 62,
  slots: [
    { id: "A1", row: 1, col: 1, name: "Feed Parameters", w: 409, h: 43 },
    { id: "B1", row: 2, col: 1, name: "Video (In-Feed Ad or Content)", w: 377, h: 678 },
    { id: "C1", row: 3, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    { id: "D1", row: 4, col: 1, name: "AI Response", w: 377, h: 446 },
    { id: "E1", row: 5, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    { id: "F1", row: 6, col: 1, name: "Video (In-Feed Ad or Content)", w: 377, h: 678 },
    {
      id: "G1",
      row: 7,
      col: 1,
      name: "Linkout - S (List View)",
      w: 377,
      h: 399,
      grid: true,
      cols: 1,
      rows: 3,
    },
    { id: "H1", row: 8, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    { id: "I1", row: 9, col: 1, name: "Video (In-Feed Ad or Content)", w: 377, h: 678 },
    { id: "J1", row: 10, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    {
      id: "K1",
      row: 11,
      col: 1,
      name: "Linkout - S (List View)",
      w: 377,
      h: 386,
      grid: true,
      cols: 1,
      rows: 3,
    },
    { id: "L1", row: 12, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    { id: "M1", row: 13, col: 1, name: "Video (In-Feed Ad or Content)", w: 377, h: 678 },
    {
      id: "N1",
      row: 14,
      col: 1,
      name: "Linkout - M (Grid View)",
      w: 377,
      h: 411,
      grid: true,
      cols: 2,
      rows: 2,
    },
    {
      id: "O1",
      row: 15,
      col: 1,
      name: "Linkout - M (Grid View)",
      w: 377,
      h: 246,
      grid: true,
      cols: 2,
      rows: 1,
    },
    { id: "P1", row: 16, col: 1, name: "Video (In-Feed Ad or Content)", w: 377, h: 678 },
    { id: "Q1", row: 17, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    {
      id: "R1",
      row: 18,
      col: 1,
      name: "Linkout - S (List View)",
      w: 377,
      h: 386,
      grid: true,
      cols: 1,
      rows: 3,
    },
    { id: "S1", row: 19, col: 1, name: "Linkout - S (List View)", w: 377, h: 95 },
    { id: "T1", row: 20, col: 1, name: "Video (In-Feed Ad or Content)", w: 377, h: 678 },
  ],
};
