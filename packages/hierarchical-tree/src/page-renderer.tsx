"use client";

import * as React from "react";

import { mergeSlotRenderers } from "./default-slot-renderers";
import { defaultUiRenderers } from "./default-ui-renderers";
import { pickBreakpoint } from "./pick-breakpoint";
import { renderNode, resolveMissingUiVariantPolicy } from "./render-node";
import type { PageRendererProps } from "./types";
import { useContainerWidth } from "./use-container-width";

/**
 * Walks a `Page` artifact and renders it as a React tree.
 *
 * Wires together the four moving parts of the runtime walker:
 *
 * 1. **Container measurement** — `useContainerWidth` tracks the host
 *    element's inline size via ResizeObserver. Seeded with
 *    `defaultWidth` (0 = mobile-first) for the first paint.
 * 2. **Breakpoint pick** — `pickBreakpoint` selects the largest
 *    `LayoutTree.minWidth` ≤ current width.
 * 3. **Atomic re-render across breakpoints** — keying the rendered
 *    subtree on `chosen.id` forces a fresh subtree on every
 *    breakpoint cross (spec §2.7 commitment 3).
 * 4. **Recursive walk** — `renderNode` dispatches each `LayoutNode`
 *    to the matching `UiRenderer` / `SlotRenderer`.
 *
 * Host extension seams:
 *
 * - `uiRenderers` — merged on top of `defaultUiRenderers` (20
 *   primitives). Use to register composites.
 * - `slotRenderers` — merged on top of `defaultSlotRenderers`
 *   (content/video/linkout). Use to swap in production wiring
 *   (e.g. the real `<DynamicLinkouts>`).
 * - `resolveSlotProps` — host-supplied per-slot prop adapter
 *   (spec §3.6).
 * - `forcedWidth` — bypasses ResizeObserver entirely. For
 *   testing / Storybook / hosts that own width tracking.
 *
 * The walker is `'use client'` only because of `ResizeObserver`.
 * Inner UI / Slot renderers are server-component-friendly where
 * the underlying `@genuin/ui` primitive is.
 *
 * The component renders a measured `<div>` as the host element —
 * the host wrapper may sit inside any further chrome the page wants
 * (Container, padding, sticky chrome, etc.) and the walker measures
 * its inner width.
 */
export function PageRenderer({
  page,
  uiRenderers,
  slotRenderers,
  resolveSlotProps,
  forcedWidth,
  defaultWidth = 0,
  onMissingUiVariant,
}: PageRendererProps): React.ReactElement {
  const { ref, width } = useContainerWidth<HTMLDivElement>(defaultWidth);
  const effectiveWidth = forcedWidth ?? width;
  const chosen = pickBreakpoint(effectiveWidth, page.breakpoints);

  // Merge host-supplied overrides on top of the defaults. The walker
  // doesn't memoise these — they're plain object spreads; React
  // Compiler can hoist if profiling shows it's needed.
  const mergedUiRenderers = uiRenderers ? { ...defaultUiRenderers, ...uiRenderers } : defaultUiRenderers;
  const mergedSlotRenderers = mergeSlotRenderers(slotRenderers);
  const policy = resolveMissingUiVariantPolicy(onMissingUiVariant);

  return (
    <div ref={ref} data-page-id={page.id} data-active-breakpoint={chosen.minWidth}>
      {/*
        Keying on the active tree's id forces a fresh subtree across
        breakpoint crosses — no in-place reconciliation. Spec §2.7
        commitment 3 ("Global swap, atomic re-render").
      */}
      <React.Fragment key={chosen.id}>
        {renderNode(chosen.root, {
          uiRenderers: mergedUiRenderers,
          slotRenderers: mergedSlotRenderers,
          resolveSlotProps,
          onMissingUiVariant: policy,
        })}
      </React.Fragment>
    </div>
  );
}
