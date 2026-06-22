import type * as React from "react";

import type { LayoutNode, LayoutTree, Page, SlotKind, SlotNode, SlotStyle, UiNode } from "./schema";

/**
 * Re-export the artifact types. The Zod schema in `./schema.ts` is the
 * single source of truth; this module surfaces the inferred TypeScript
 * types for consumers who don't need the validator at hand.
 */
export type { LayoutNode, LayoutTree, Page, SlotKind, SlotNode, SlotStyle, UiNode };

/**
 * Host-supplied UI renderer. Maps a `uiVariant` string (e.g. `'row'`,
 * `'heading'`) to a React component that takes the authored `props`
 * blob and the walker's recursive `children`.
 *
 * Spec §4.3: the closed v0 registry contains 20 primitives. Hosts can
 * extend with composites by spreading into {@link UiRenderers}.
 */
export type UiRenderer = React.ComponentType<{
  props: Record<string, unknown>;
  children?: React.ReactNode;
}>;

/** String → component lookup. Closed at the registry level. */
export type UiRenderers = Record<string, UiRenderer>;

/**
 * Renderer-ready props for a {@link SlotNode}, produced by
 * {@link ResolveSlotProps}. The walker passes this through unchanged.
 */
export type ResolvedSlotProps = Record<string, unknown>;

/**
 * Host-supplied per-slot prop adapter. Spec §3.6's `resolveSlotProps`
 * seam — turns authored `props` into renderer-ready props (data
 * fetches, transforms, etc.).
 */
export type ResolveSlotProps = (slot: SlotNode, kind: SlotKind) => ResolvedSlotProps;

/**
 * Renderer for one {@link SlotKind}. The walker passes the matched
 * `SlotNode` plus already-resolved props bundle.
 */
export type SlotRenderer = (args: { slot: SlotNode; props: ResolvedSlotProps }) => React.ReactNode;

/** Closed `SlotKind → renderer` lookup. Walker enforces all three kinds resolve. */
export type SlotRenderers = Record<SlotKind, SlotRenderer>;

/**
 * What to do when a `uiVariant` is missing from the registry.
 *
 * - `'throw'` — defensive default for dev/staging; the walker throws
 *   so authoring errors surface fast.
 * - `'fallback'` — production-safe; the walker renders a visible chip
 *   with the unresolved variant name so the drift is loud but not
 *   fatal.
 * - Function — host-supplied fallback (e.g. log + render a hidden
 *   placeholder).
 */
export type OnMissingUiVariant = "throw" | "fallback" | ((variant: string) => React.ReactNode);

/**
 * Props for {@link PageRenderer}. The host supplies the `Page` artifact
 * plus the four host-extension seams from spec §3.6:
 * `uiRenderers`, `slotRenderers`, `resolveSlotProps`, and the
 * missing-variant policy.
 */
export interface PageRendererProps {
  /** The validated Page artifact to render. */
  page: Page;
  /**
   * Custom UI renderers. Merged on top of the default registry
   * (`defaultUiRenderers`). Use this to register composite components
   * (`page-header`, `linkout-stack`, etc.).
   */
  uiRenderers?: UiRenderers;
  /**
   * Custom Slot renderers. Merged on top of the default registry
   * (`defaultSlotRenderers`). Hosts typically override only for
   * testing or to wire in a custom video player surface.
   */
  slotRenderers?: Partial<SlotRenderers>;
  /** Per-slot prop adapter. Spec §3.6 seam. */
  resolveSlotProps?: ResolveSlotProps;
  /**
   * Bypass `useContainerWidth` and pick the breakpoint matching this
   * width directly. Used by tests, Storybook, and any host that owns
   * its own width tracking.
   */
  forcedWidth?: number;
  /**
   * Seed width before {@link ResizeObserver} fires. Eliminates a
   * blank first paint when SSR-ing. Defaults to `0` (mobile-first).
   */
  defaultWidth?: number;
  /**
   * Policy when a `uiVariant` isn't in the registry. Defaults to
   * `'throw'` in development and `'fallback'` in production —
   * decided at render time by `process.env.NODE_ENV`.
   */
  onMissingUiVariant?: OnMissingUiVariant;
}
