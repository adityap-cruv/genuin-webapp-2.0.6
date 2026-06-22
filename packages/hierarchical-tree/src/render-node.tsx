import * as React from "react";

import type { LayoutNode, SlotNode } from "./schema";
import type { OnMissingUiVariant, ResolveSlotProps, SlotRenderers, UiRenderers } from "./types";

/**
 * Walker context — the registries and seams the recursive walker
 * threads through every dispatch call.
 */
export interface RenderContext {
  uiRenderers: UiRenderers;
  slotRenderers: SlotRenderers;
  resolveSlotProps?: ResolveSlotProps;
  onMissingUiVariant: OnMissingUiVariant;
}

/**
 * Render a single {@link LayoutNode}. Recurses into UI children;
 * dispatches to the matching `uiVariant` / `kind` from the host
 * registries.
 *
 * Spec §2.6 — rendering rules. The walker enforces:
 * - `SlotNode.kind` always present (defensive runtime check; the
 *   Zod validator catches this earlier).
 * - `UiNode.uiVariant` resolves via `uiRenderers`; missing variants
 *   go through `onMissingUiVariant`.
 * - `sticky: true` on a `content` Slot wraps the element in
 *   `gencl:sticky gencl:top-0`. Video / linkout sticky is the SDK's
 *   call (spec §3.3).
 * - UI children get a deterministic key (`uiVariant + index`); Slot
 *   children get keyed by `name` (spec §2.5 — `name` is stable
 *   cross-breakpoint metadata).
 */
export function renderNode(node: LayoutNode, ctx: RenderContext): React.ReactNode {
  if (node.type === "slot") {
    return renderSlot(node, ctx);
  }

  const Component = ctx.uiRenderers[node.uiVariant];
  if (!Component) {
    return renderMissingUiVariant(node.uiVariant, ctx.onMissingUiVariant);
  }
  const children = node.children?.map((child, i) => (
    <React.Fragment key={keyFor(child, i)}>{renderNode(child, ctx)}</React.Fragment>
  ));
  return <Component props={node.props ?? {}}>{children}</Component>;
}

function renderSlot(node: SlotNode, ctx: RenderContext): React.ReactNode {
  const renderer = ctx.slotRenderers[node.kind];
  if (!renderer) {
    // Defensive — the schema's closed `SlotKind` enum should make this
    // unreachable, but runtime drift is cheap to guard against.
    throw new Error(`No slot renderer registered for kind '${node.kind}'`);
  }
  const resolved =
    ctx.resolveSlotProps?.(node, node.kind) ?? (node.props as Record<string, unknown> | undefined) ?? {};
  const element = renderer({ slot: node, props: resolved });
  if (node.sticky && node.kind === "content") {
    return (
      <div data-slot-sticky="true" className="gencl:sticky gencl:top-0">
        {element}
      </div>
    );
  }
  return element;
}

/**
 * Generate a stable React key for a child. UI nodes get
 * `uiVariant + index` (the index keeps duplicate sibling variants
 * from colliding); Slot nodes use their cross-breakpoint `name`.
 */
function keyFor(node: LayoutNode, index: number): string {
  if (node.type === "slot") return `slot:${node.name}`;
  return `ui:${node.uiVariant}:${index}`;
}

/**
 * Apply the missing-uiVariant policy:
 *
 * - `'throw'` → bubble up an Error so authoring drift is loud.
 * - `'fallback'` → render a visible chip with the unresolved key.
 * - function → host-supplied renderer.
 */
function renderMissingUiVariant(variant: string, policy: OnMissingUiVariant): React.ReactNode {
  if (typeof policy === "function") return policy(variant);
  if (policy === "throw") {
    throw new Error(`No uiRenderer registered for uiVariant '${variant}'`);
  }
  // 'fallback' — render a visible, deliberately ugly chip so the drift
  // gets noticed in QA without taking down the page.
  return (
    <span
      data-slot="missing-ui-variant"
      role="status"
      style={{
        display: "inline-block",
        padding: "2px 6px",
        background: "#fde047", // amber-300
        color: "#7c2d12", // amber-900
        border: "1px solid #f59e0b",
        borderRadius: 4,
        fontFamily: "monospace",
        fontSize: 12,
      }}>
      missing uiVariant: {variant}
    </span>
  );
}

/**
 * Resolve the effective `onMissingUiVariant` policy. Defaults to
 * `'throw'` in development and `'fallback'` in production — matches
 * the locked decision in the walker plan.
 */
export function resolveMissingUiVariantPolicy(supplied: OnMissingUiVariant | undefined): OnMissingUiVariant {
  if (supplied !== undefined) return supplied;
  return process.env.NODE_ENV === "production" ? "fallback" : "throw";
}
