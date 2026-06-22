/**
 * `@genuin/hierarchical-tree` — runtime walker for Page artifacts.
 *
 * Public surface:
 * - `<PageRenderer>` — walks a Page artifact and renders it.
 * - `defaultUiRenderers` — the 20-entry default UI registry.
 * - `defaultSlotRenderers` — content / video / linkout slot defaults.
 * - `pageSchema` — Zod schema for runtime validation.
 * - Artifact types.
 *
 * See {@link HIERARCHICAL_TREE_SPEC.md} for the artifact contract,
 * and `HIERARCHICAL_TREE_RUNTIME_WALKER_PLAN.md` for the runtime
 * walker's design decisions.
 */

export { PageRenderer } from "./page-renderer";
export { DEFAULT_UI_VARIANTS, defaultUiRenderers } from "./default-ui-renderers";
export { defaultSlotRenderers } from "./default-slot-renderers";
export { pickBreakpoint } from "./pick-breakpoint";
export { useContainerWidth } from "./use-container-width";
export {
  layoutNodeSchema,
  layoutTreeSchema,
  pageSchema,
  slotKindSchema,
  slotNodeSchema,
  slotStyleSchema,
  uiNodeSchema,
} from "./schema";
export type {
  LayoutNode,
  LayoutTree,
  Page,
  SlotKind,
  SlotNode,
  SlotStyle,
  UiNode,
} from "./schema";
export type {
  OnMissingUiVariant,
  PageRendererProps,
  ResolveSlotProps,
  ResolvedSlotProps,
  SlotRenderer,
  SlotRenderers,
  UiRenderer,
  UiRenderers,
} from "./types";
