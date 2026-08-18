"use client";

/**
 * VideoGrid — the `VideoFeed` tiles laid out as a grid (2 × 2 on desktop, single column on
 * mobile). Same data props and the same tile / expand-view building blocks as `VideoFeed`;
 * only the layout and the "which tile is active" logic differ.
 */

import { checkAndAppendHttps, cn } from "@genuin/ui/lib/utils";
import { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VideoTypes } from "@genuin/components/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { isSponsoredVideo, SponsoredTag } from "@genuin/components/molecules/feed-player/control-layer/controls/sponsored-tag";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import {
  buildVideoMetaText,
  useVideoFeedData,
  VIDEO_FEED_CONTROL_SIZE,
  VideoFeedExpandView,
} from "@genuin/components/organisms/video-feed/video-feed";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";
import { FEED_SKELETON_THEME, PlayerSkeleton } from "@genuin/components/templates/feed/feed-skeleton";

import type { VideoGridProps, VideoGridTileProps } from "./video-grid.types";

// Same lazy chunks the production feed / SDK tile load.
const FeedPlayer = lazy(() =>
  import("@genuin/components/molecules/feed-player").then((m) => ({ default: m.FeedPlayer }))
);
// V2 controls directly (not the `design_system=v2`-gated switcher): mute → play/pause → expand top-right.
const Controls = lazy(() =>
  import("@genuin/components/molecules/feed-player/control-layer/controls/controls-v2").then((m) => ({
    default: m.Controls,
  }))
);
// Linkout CTA bar — the same dynamic card the SDK embed tile renders (via `organisms/linkouts`).
// Used directly (not through the `Linkouts` wrapper) so we can pin its width bucket and disable
// its timed auto-advance without touching shared components.
const DynamicLinkouts = lazy(() =>
  import("@genuin/components/molecules/linkout-new/linkouts-dynamic").then((m) => ({ default: m.DynamicLinkouts }))
);

/**
 * Width (px) handed to the linkout card as `effectiveVideoWidth`. The card picks its layout by
 * width bucket (`linkouts-sheet-config.ts`: <250 → compact chip, <300 → default, <400 → active,
 * ≥400 → expanded card). The tile design specifies the compact chip (icon · CTA · chevron · dots)
 * on every tile size, so we pin the bucket instead of passing the real tile width.
 */
export const VIDEO_GRID_LINKOUT_LAYOUT_WIDTH = 249;

// ─── Tile (player + Sponsored pill + controls + meta + linkout bar) ─────────────────────────────

/**
 * One grid tile: `PlayerProvider → FeedPlayer` + Sponsored pill (top-left) + mute · play/pause ·
 * expand cluster (top-right, active tile only) + a bottom stack of the
 * `date • duration • description` line directly above the linkout CTA bar.
 */
export function VideoGridTile({
  post,
  index,
  isActive,
  totalVideos,
  activeIndex,
  size,
  showControls,
  showMeta,
  showLinkouts,
  showSponsoredTag,
  loopSelf,
  expanded,
  onToggleExpand,
  onIterationEnd,
  onSelect,
}: VideoGridTileProps) {
  const { theme } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const video = post.video;

  const metaText = useMemo(() => buildVideoMetaText(video), [video]);
  const isSponsored = showSponsoredTag && isSponsoredVideo(video);

  // First linkout of the video, normalised the way `organisms/linkouts` does (sorted by
  // position, absolute URLs) so `DynamicLinkouts` gets the exact production input.
  const linkout = useMemo(() => {
    const first = Array.isArray(video?.linkouts) ? video.linkouts[0] : undefined;
    if (!first) return null;
    const links: LinkData[] = [...((first.links ?? []) as LinkData[])]
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((link) => (link.link ? { ...link, link: checkAndAppendHttps(link.link) } : link));
    const ctaText = first.cta_text ?? "";
    const ctaLink = first.cta_link ? checkAndAppendHttps(first.cta_link) : "";
    if (!links.length && !ctaText) return null;
    return { links, ctaText, ctaLink };
  }, [video?.linkouts]);
  const linkoutAnalytics = useMemo(
    () => buildLinkoutsAnalyticsData({ videoDetails: video ?? undefined, totalVideos, positionIndex: index }),
    [video, totalVideos, index]
  );

  const handleIterationEnd = useCallback(
    (move?: boolean) => {
      if (move === false) return;
      onIterationEnd();
    },
    [onIterationEnd]
  );

  if (!video) return <div className="gencl:h-full gencl:w-full gencl:bg-black" aria-hidden />;

  return (
    <PlayerProvider
      isEmbed
      index={index}
      isActive={isActive}
      videoId={video.id}
      videoUrl={video.source}
      explicitAutoPlay={isActive}
      explicitLoop={loopSelf && isActive}
      totalVideos={totalVideos}
      activeIndex={activeIndex}
      showExpandView={expanded}
      toggleExpandView={onToggleExpand}
      onPlayerIterationEnd={handleIterationEnd}
      videoDescription={video.descritptionText}
      videoType={video.videoType ?? VideoTypes.Content}>
      <div
        data-slot="video-grid-tile-inner"
        data-video-id={video.id}
        data-active={isActive || undefined}
        onClick={onSelect}
        className={cn(
          "gencl:group gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:bg-black",
          onSelect && !isActive && "gencl:cursor-pointer"
        )}>
        <SafeSuspense
          fallback={
            <PlayerSkeleton colors={FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"]} isMobile={isMobile} />
          }
          errorFallback={null}>
          <FeedPlayer
            id={"video-grid-player--" + video.id}
            videoId={video.id}
            src={video.source}
            poster={video.thumbnail}
            adUrl={video.adUrl ?? undefined}
            adsPlatform={video.adsPlatform}
            adTagObject={post.adTagObject ?? undefined}
            videoDescription={video.descritptionText}
            videoType={video.videoType ?? VideoTypes.Content}
            className="gencl:h-full! gencl:w-full! gencl:object-cover gencl:bg-cover!"
            playsInline
            index={index}
            isActive={isActive}
            playerSize={size}
            sponsorshipInfo={post.sponsored}
          />
        </SafeSuspense>

        {isSponsored && (
          <SponsoredTag size={VIDEO_FEED_CONTROL_SIZE} className="gencl:absolute gencl:left-3 gencl:top-3 gencl:z-20" />
        )}

        {showControls && isActive && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <Controls
              variant="default"
              enableExpand
              size={VIDEO_FEED_CONTROL_SIZE}
              // `default` carries a webapp header offset (`top-12`); this tile has no header.
              className="gencl:top-0! gencl:p-3!"
            />
          </SafeSuspense>
        )}

        {((showMeta && metaText) || (showLinkouts && linkout)) && (
          <div
            data-slot="video-grid-bottom"
            className={cn(
              // One bottom stack: meta line directly above the CTA bar (Figma: ~8 px apart).
              "gencl:pointer-events-none gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:z-10",
              "gencl:flex gencl:flex-col gencl:gap-2 gencl:bg-gradient-to-t gencl:from-black/70 gencl:to-transparent",
              "gencl:px-3 gencl:pb-2 gencl:pt-8"
            )}>
            {showMeta && metaText && (
              <p
                data-slot="video-feed-meta"
                className="gencl:line-clamp-2 gencl:text-body-2-medium gencl:text-white gencl:drop-shadow-sm"
                title={metaText}>
                {metaText}
              </p>
            )}
            {showLinkouts && linkout && (
              <div
                data-slot="video-feed-linkouts"
                className="gencl:pointer-events-auto gencl:z-20"
                onClick={(event) => event.stopPropagation()}>
                <SafeSuspense fallback={null} errorFallback={null}>
                  <DynamicLinkouts
                    links={linkout.links}
                    ctaText={linkout.ctaText}
                    ctaLink={linkout.ctaLink}
                    view="embed"
                    layout="overlay"
                    // Always mounted (the design shows the bar on every tile), so `isActive` is
                    // only about which tile is playing.
                    isActive
                    analyticsEventData={linkoutAnalytics}
                    effectiveVideoWidth={VIDEO_GRID_LINKOUT_LAYOUT_WIDTH}
                    disableAutoAdvance
                  />
                </SafeSuspense>
              </div>
            )}
          </div>
        )}
      </div>
    </PlayerProvider>
  );
}

// ─── VideoGrid ───────────────────────────────────────────────────────────────────────────────

/** Default tile sizes (px) — desktop/tablet and mobile. 2×2 → 1044×590, 1×4 → 382×884 (8 px gap). */
export const VIDEO_GRID_TILE_SIZE = {
  desktop: { width: 518, height: 291, columns: 2 },
  mobile: { width: 382, height: 215, columns: 1 },
} as const;

const DEFAULT_LIMIT = 4;
const DEFAULT_GAP = 8;

/**
 * Grid of video tiles for our own pages. One tile is active (playing) at a time; when its
 * video ends the next tile becomes active (wrapping to the first). Tap a tile to activate
 * it. Expand opens the real full-screen `FeedView` on that video.
 *
 * @example
 * <VideoGrid communityId="1fa079ce3e000d64" />
 * <VideoGrid videoIds={["…", "…", "…", "…"]} />
 */
export function VideoGrid({
  videoId,
  videoIds,
  communityId,
  groupId,
  posts: staticPosts,
  enabled,
  limit = DEFAULT_LIMIT,
  autoAdvance = true,
  loop = true,
  showControls = true,
  showMeta = true,
  showLinkouts = true,
  showSponsoredTag = true,
  tileWidth,
  tileHeight,
  columns,
  gap = DEFAULT_GAP,
  onActiveVideoChange,
  onExpandChange,
  className,
  style,
  ...sectionProps
}: VideoGridProps) {
  const data = useVideoFeedData({ videoId, videoIds, communityId, groupId, posts: staticPosts, enabled });
  const { posts: allPosts, isLoading, isError } = data;
  const { theme } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();

  const defaults = isMobile ? VIDEO_GRID_TILE_SIZE.mobile : VIDEO_GRID_TILE_SIZE.desktop;
  const width = tileWidth ?? defaults.width;
  const height = tileHeight ?? defaults.height;
  const cols = columns ?? defaults.columns;

  const posts = useMemo(() => allPosts.slice(0, limit), [allPosts, limit]);
  const total = posts.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const expandIndexRef = useRef(0);

  // Keep the active index valid when the list shrinks/changes.
  useEffect(() => {
    if (activeIndex >= total && total > 0) setActiveIndex(0);
  }, [activeIndex, total]);

  useEffect(() => {
    const post = posts[activeIndex];
    if (post) onActiveVideoChange?.(post, activeIndex);
  }, [activeIndex, posts, onActiveVideoChange]);

  const handleIterationEnd = useCallback(() => {
    if (!autoAdvance || total === 0) return;
    setActiveIndex((current) => {
      if (current < total - 1) return current + 1;
      return loop ? 0 : current;
    });
  }, [autoAdvance, loop, total]);

  const openExpand = useCallback(() => {
    expandIndexRef.current = activeIndex;
    setExpanded(true);
    onExpandChange?.(true);
  }, [activeIndex, onExpandChange]);

  const closeExpand = useCallback(() => {
    setExpanded(false);
    onExpandChange?.(false);
    // The expanded feed may have scrolled beyond the visible tiles — clamp back into the grid.
    setActiveIndex(Math.min(expandIndexRef.current, Math.max(total - 1, 0)));
  }, [onExpandChange, total]);

  const toggleExpand = useCallback(() => {
    if (expanded) closeExpand();
    else openExpand();
  }, [expanded, openExpand, closeExpand]);

  const handleExpandIndexChange = useCallback((index: number) => {
    expandIndexRef.current = index;
  }, []);

  const skeletonColors = FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"];
  const size = useMemo(() => ({ width, height }), [width, height]);

  return (
    <section
      data-slot="video-grid"
      data-expanded={expanded || undefined}
      aria-label="Video grid"
      className={cn("gencl:grid gencl:max-w-full gencl:text-white", className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${width}px)`,
        gap,
        ...style,
      }}
      {...sectionProps}>
      {isLoading ? (
        Array.from({ length: limit }, (_, index) => (
          <div key={index} className="gencl:overflow-hidden gencl:rounded-xl gencl:bg-black" style={size}>
            <PlayerSkeleton colors={skeletonColors} isMobile={isMobile} />
          </div>
        ))
      ) : isError ? (
        <StateMessage size={size}>Couldn’t load videos. Please try again.</StateMessage>
      ) : total === 0 ? (
        <StateMessage size={size}>No videos available.</StateMessage>
      ) : (
        posts.map((post, index) => {
          const isActive = index === activeIndex && !expanded;
          return (
            <div
              key={post.video?.id ?? index}
              data-slot="video-grid-tile"
              data-index={index}
              className="gencl:relative gencl:overflow-hidden gencl:rounded-xl gencl:bg-black"
              style={size}>
              <VideoGridTile
                post={post}
                index={index}
                isActive={isActive}
                totalVideos={total}
                activeIndex={activeIndex}
                size={size}
                showControls={showControls}
                showMeta={showMeta}
                showSponsoredTag={showSponsoredTag}
                showLinkouts={showLinkouts}
                loopSelf={loop && total === 1}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onIterationEnd={handleIterationEnd}
                onSelect={index === activeIndex ? undefined : () => setActiveIndex(index)}
              />
            </div>
          );
        })
      )}
      {expanded && total > 0 && (
        <VideoFeedExpandView
          data={data}
          startIndex={expandIndexRef.current}
          onClose={closeExpand}
          onActiveIndexChange={handleExpandIndexChange}
        />
      )}
    </section>
  );
}

function StateMessage({ children, size }: { children: React.ReactNode; size: { width: number; height: number } }) {
  return (
    <div
      role="status"
      className="gencl:flex gencl:items-center gencl:justify-center gencl:rounded-xl gencl:bg-black gencl:p-4 gencl:text-center gencl:text-body-1-normal gencl:text-white/80"
      style={size}>
      {children}
    </div>
  );
}
