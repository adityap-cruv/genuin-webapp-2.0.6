"use client";

import type { ReactNode } from "react";

import { AiResponse } from "@genuin/components/molecules/ai-response";
import { DynamicLinkouts } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import type { DynamicLinkoutsProps } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";

import type { SlotKind } from "./types";
import { useCellSize } from "./use-cell-size";

/**
 * Bridge between a single grid cell and `<DynamicLinkouts>`.
 *
 * - `kind="video"` → `view="embed"` + `layout="overlay"`. The cell's
 *   measured width is forwarded as `effectiveVideoWidth` so the
 *   width-bucketed scenario picker
 *   (`embed-xs / -sml / -default / -active / -expand`) tracks the
 *   cell's live size — same wiring the Storybook "Dynamic View Embed"
 *   harness uses. The optional `videoBackdrop` ReactNode renders
 *   behind the overlay (poster image in Storybook, real `<VideoPlayer>`
 *   in production).
 * - `kind="linkout"` → `view="responsive"`. `<DynamicLinkouts>` runs
 *   its own ResizeObserver inside `<ResponsiveLinkCard>`, so we don't
 *   forward `(w, h)` here. The host controls `responsiveState`
 *   ("default" | "expand") via the `slotProps` it passes through
 *   `<HierarchicalGrid>`'s `resolveSlotProps`.
 *
 * See HIERARCHICAL_GRID_PLAN.md § 8.
 */
export interface SlotContentProps {
  kind: SlotKind;
  /** Pre-resolved props for the underlying `<DynamicLinkouts>`. The
   *  bridge layers `view` / `layout` / `effectiveVideoWidth` on top
   *  per the slot kind. Anything the caller passes here wins for
   *  fields the bridge doesn't manage (links, ctaText, ctaLink,
   *  analyticsEventData, responsiveState, etc.). */
  slotProps: DynamicLinkoutsProps;
  /** For `kind="video"` only: rendered behind the linkouts overlay,
   *  filling the cell. Storybook passes a poster image; production
   *  passes a real `<VideoPlayer>`. */
  videoBackdrop?: ReactNode;
}

export function SlotContent({ kind, slotProps, videoBackdrop }: SlotContentProps) {
  const { ref, size } = useCellSize<HTMLDivElement>();

  if (kind === "ai-response") {
    // AI response placeholder. The component fills its container
    // and decides internally whether to show its trailing video
    // carousel based on available height. We add an 8 px inset so
    // the text doesn't kiss the slot edges.
    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          padding: 8,
          boxSizing: "border-box",
        }}>
        <AiResponse />
      </div>
    );
  }

  if (kind === "video") {
    // Video cell: backdrop fills the cell, linkouts overlay sits at
    // the bottom. Mirrors the EmbedHarness layout in
    // `dynamic-linkout-embed.stories.tsx` so the production overlay
    // composes on top of a real video element the same way.
    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          borderRadius: 12,
          // Neutral fallback so cells without a backdrop don't show
          // the white storybook surface. Production hosts always
          // supply a backdrop, so this only matters for the empty
          // bridge path.
          backgroundColor: "#0a0a0a",
        }}>
        {videoBackdrop}
        <div
          style={{
            zIndex: 1,
            width: "100%",
            // 8 px on TOP only. Horizontal insets are owned by the
            // dynamic-sheet panel itself (see `panelFullClassName`'s
            // `mx-2 w-[calc(100%_-_16px)]`); doubling them here
            // would double the visible side gap. Bottom flush so
            // the carousel dots sit on the cell edge.
            padding: "8px 0 0",
            boxSizing: "border-box",
          }}>
          <DynamicLinkouts {...slotProps} view="embed" layout="overlay" effectiveVideoWidth={size.w} />
        </div>
      </div>
    );
  }

  // Linkout cell: the responsive wide card fills the cell and runs
  // its own size + orientation picker via container queries. No
  // backdrop and no padding — the card itself owns its surface.
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}>
      <DynamicLinkouts {...slotProps} view="responsive" />
    </div>
  );
}
