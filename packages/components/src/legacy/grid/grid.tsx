"use client";

import { useCallback, useMemo } from "react";

import type { SlotShape, SlotKind } from "@genuin/components/legacy/hierarchical-grid";
import { HierarchicalGrid } from "@genuin/components/legacy/hierarchical-grid";
import type { DynamicLinkoutsProps } from "@genuin/components/molecules/linkout-new/linkouts-dynamic";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import { LINKOUT_FIGMA_CAROUSEL, LINKOUT_FIGMA_CTA } from "@genuin/components/organisms/linkouts/linkouts.fixtures";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { ManagedVideo } from "./managed-video";
import { PlaybackCoordinator } from "./playback-coordinator";

const ANALYTICS = buildLinkoutsAnalyticsData({});

function resolveSlotProps(_slot: SlotShape, _kind: SlotKind): DynamicLinkoutsProps {
  return {
    links: LINKOUT_FIGMA_CAROUSEL,
    ctaText: LINKOUT_FIGMA_CTA.ctaText,
    ctaLink: LINKOUT_FIGMA_CTA.ctaLink,
    isActive: true,
    analyticsEventData: ANALYTICS,
    responsiveState: "expand",
  };
}

/** Stable hash from a slot id + cell index → a deterministic
 *  position into the videos array so each cell gets a different
 *  video. */
function pickVideo(videos: PostDetailsType[], slot: SlotShape, cellIndex: number): PostDetailsType | undefined {
  if (videos.length === 0) return undefined;
  let seed = cellIndex;
  for (let i = 0; i < slot.id.length; i++) seed += slot.id.charCodeAt(i);
  return videos[seed % videos.length];
}

/**
 * Demo `/grid` page. Renders the hierarchical-grid template with
 * **real videos from the home feed** behind the linkouts overlay
 * in each video cell.
 *
 * Single-active playback is coordinated by `<PlaybackCoordinator>`
 * — only one cell's `<VideoPlayer>` plays at a time. The first
 * cell to mount auto-claims the active slot; clicking any other
 * cell switches the active id, pausing the previous one. Same
 * pattern as the embed grid view's `<EmbedTile isActive={…}>`,
 * standalone here.
 */
export function Grid() {
  const { data } = useFeed("HOME");
  const videos = useMemo<PostDetailsType[]>(() => data?.pages.flatMap((p) => p.feed) ?? [], [data]);

  // Stabilized closure: re-creates only when the videos array
  // identity changes (i.e. on feed page load). Without this every
  // Grid render would hand `<HierarchicalGrid>` a fresh prop and
  // cascade re-renders through every Slot.
  const renderVideoBackdrop = useCallback(
    (slot: SlotShape, cellIndex: number) => {
      const post = pickVideo(videos, slot, cellIndex);
      // `post.video` became optional in the release schema, so we
      // also bail when there's no video on the matched post.
      if (!post || !post.video) {
        // Feed not loaded yet — neutral black while we wait.
        return (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0a0a0a",
              pointerEvents: "none",
            }}
          />
        );
      }
      // Autoplay seat is claimed synchronously by the first
      // `<ManagedVideo>` whose useState lazy init runs — see
      // `managed-video.tsx`.
      return (
        <ManagedVideo
          id={`${slot.id}/${cellIndex}/${post.video.id}`}
          src={post.video.source}
          poster={post.video.thumbnailM ?? post.video.thumbnail}
        />
      );
    },
    [videos]
  );

  return (
    <PlaybackCoordinator>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}>
        <HierarchicalGrid
          defaultWidth={1280}
          resolveSlotProps={resolveSlotProps}
          renderVideoBackdrop={renderVideoBackdrop}
        />
      </div>
    </PlaybackCoordinator>
  );
}
