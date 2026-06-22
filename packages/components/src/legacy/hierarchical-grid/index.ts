// Public surface of the hierarchical-grid template. Internals
// (Slot, SlotContent, IsolatedSheetContext, the hooks, the layout
// modules) stay module-private — consumers compose through
// <HierarchicalGrid>'s `resolveSlotProps` + `renderVideoBackdrop`
// props. Re-add a re-export here only when an external use case
// actually needs it.
export { HierarchicalGrid } from "./hierarchical-grid";
export type { HierarchicalGridProps } from "./hierarchical-grid";
export type { Slot as SlotShape, SlotKind } from "./types";
