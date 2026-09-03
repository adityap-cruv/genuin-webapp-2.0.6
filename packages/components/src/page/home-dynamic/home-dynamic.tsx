"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

import {
  FeedViewOverlay,
  FeedViewOverlayProvider,
  type FeedViewOverlayRequest,
} from "@genuin/components/lib/feed-view/feed-view-overlay";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { EventSurface, EventSurfacePanel } from "@genuin/components/organisms/event-surface/event-surface";

import { BlockVisibilityContext, COMPONENT_REGISTRY } from "./component-registry";
import type {
  ColumnNode,
  HomeDataPage,
  HomeLayoutManifest,
  LayoutNode,
  LayoutRow,
  WidgetData,
  WidgetNode,
} from "./contract";
import { HomeDynamicSkeleton } from "./home-dynamic-skeleton";
import { useHomeFeed, useHomeLayout } from "./use-home-data";

// ─── Layout renderer (walks the BFF layout tree, joins widgets to content by dataKey) ────
// Consolidated here from the former layout-renderer.tsx.

type DataMap = Record<string, WidgetData>;

/**
 * One widget filling its grid cell; the registry entry adapts the data to a component.
 *
 * A widget that declares an `intrinsicSize` publishes that ratio to the stylesheet; stacked on
 * mobile the cell is then sized by the ratio rather than by the row height (see the mobile block
 * in HOME_MOTION_CSS). An SDK grid embed draws at its OWN aspect ratio and cannot stretch, so a
 * cell taller than that ratio is dead space below the tiles.
 */
function WidgetRenderer({ node, dataMap }: { node: WidgetNode; dataMap: DataMap }) {
  const data = dataMap[node.dataKey];
  const Entry = COMPONENT_REGISTRY[node.component];
  // Skip gracefully on missing data / unknown component (forward-compatible with a backend
  // that ships content or components an older client doesn't know yet).
  if (!data || !Entry) return null;
  const { intrinsicSize, mobileIntrinsicSize } = node;
  // The cell IS the widget's `EventSurfacePanel`: `node.id` becomes the `sourceId` of everything
  // this widget emits, which is what lets a dependent filter to its own source (and what makes the
  // bus skip delivering a panel its own broadcasts).
  return (
    <EventSurfacePanel
      id={node.id}
      className="gencl:min-h-0 gencl:min-w-0"
      data-fit={intrinsicSize ? "intrinsic" : undefined}
      style={
        intrinsicSize
          ? ({
              "--gen-widget-ratio": `${intrinsicSize.width} / ${intrinsicSize.height}`,
              "--gen-widget-mobile-ratio": mobileIntrinsicSize
                ? `${mobileIntrinsicSize.width} / ${mobileIntrinsicSize.height}`
                : undefined,
            } as CSSProperties)
          : undefined
      }>
      <Entry node={node} data={data} dataMap={dataMap} />
    </EventSurfacePanel>
  );
}

/** A vertical stack occupying one cell of the row grid. */
function ColumnRenderer({ node, dataMap }: { node: ColumnNode; dataMap: DataMap }) {
  return (
    <div className="gencl:flex gencl:min-h-0 gencl:min-w-0 gencl:flex-col gencl:gap-4">
      {node.children.map((child) => (
        <NodeRenderer key={child.id} node={child} dataMap={dataMap} />
      ))}
    </div>
  );
}

function NodeRenderer({ node, dataMap }: { node: LayoutNode; dataMap: DataMap }) {
  if (node.type === "column") {
    return <ColumnRenderer node={node} dataMap={dataMap} />;
  }
  return <WidgetRenderer node={node} dataMap={dataMap} />;
}

/**
 * One row: a CSS grid with the manifest's explicit column template and a fixed content height.
 *
 * The height is deliberately INDEPENDENT of the window width. The SDK placements measure their
 * container once, at `init()`, and never re-lay-out afterwards: their drawn height is frozen at
 * whatever the cell was on first render. So any width-driven height (a fluid `aspect-ratio`, a
 * `vw` unit) is cut off from the bottom the moment the user drags the window narrower — the cell
 * shrinks, the embed does not. A per-breakpoint height has the same problem at each crossing.
 * Columns are `fr`-based and reflow freely; only the height must stay put.
 */
function RowRenderer({ row, dataMap, index }: { row: LayoutRow; dataMap: DataMap; index: number }) {
  // A widget that draws at its own ratio (an SDK grid embed) DEFINES its row's height: it fills
  // the width and derives its height from the placement's ratio, so a row track fixed at the
  // authored height leaves dead space under it on narrow screens and is overrun on wide ones.
  // Unlike the carousel/feed embeds this one does re-lay-out on resize, so a width-driven height
  // is safe here. The row's siblings (internally-scrolling panels) simply stretch to match.
  const isRatioDriven = row.children.some((child) => child.type === "widget" && child.intrinsicSize !== undefined);

  return (
    <div
      className="gen-home-row gencl:w-full"
      style={
        {
          padding: row.padding ?? 24,
          "--gen-home-delay": `${Math.min(index, 5) * 70}ms`,
          // Read back by the mobile stylesheet as each stacked cell's minimum height.
          "--gen-home-cell-h": `${row.mobileHeight ?? row.height}px`,
        } as CSSProperties
      }>
      <EventSurface
        className="gen-home-grid"
        data-rows={isRatioDriven ? "ratio" : undefined}
        ariaLabel={row.id}
        style={{
          display: "grid",
          gridTemplateColumns: row.gridTemplateColumns,
          gridTemplateRows: isRatioDriven ? "minmax(0, auto)" : "minmax(0, 1fr)",
          width: "100%",
          height: isRatioDriven ? "auto" : row.height,
          gap: row.gap ?? 16,
          columnGap: row.columnGap,
          alignItems: "stretch",
        }}>
        {row.children.map((child) => (
          <NodeRenderer key={child.id} node={child} dataMap={dataMap} />
        ))}
      </EventSurface>
    </div>
  );
}

/**
 * Fully backend-driven, infinite-scroll home page.
 *
 * The layout manifest (widget.json) and the content pages (data.json) BOTH come from the
 * BFF. Each data page is rendered through the same layout — so the structure/styling matches
 * `/home` — and appended one at a time as the user reaches the bottom. Because every row has
 * a fixed height, each page block is full-height immediately (even while its videos load),
 * so the bottom sentinel stays below the fold and never fires a burst of loads.
 *
 * Every page block stays MOUNTED for the life of the page — its layout, news/link panels and
 * scroll position never re-mount, so scrolling back up is instant with no stutter. To keep the
 * VIDEO players from piling up (they'd exhaust the browser's media limits → lag + black tiles),
 * each block tracks whether it's near the viewport and the video widgets render a real player
 * only when near, and a lightweight poster when far. So live players stay bounded to ~one
 * screen — like `/home` — while everything else stays put.
 */

function PageBlock({
  page,
  layout,
  rootRef,
}: {
  page: HomeDataPage;
  layout: HomeLayoutManifest;
  rootRef: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start `true` so a freshly-appended block (which is always near the bottom the user just
  // reached) shows its players immediately; the observer flips it off once it scrolls away.
  const [isNear, setIsNear] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => setIsNear(entries[0]?.isIntersecting ?? false), {
      root: rootRef.current,
      rootMargin: "1200px 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef]);

  // Prefer the page's OWN layout (backend-driven per-iteration variation); fall back to the shared
  // manifest for pages/backends that don't send one.
  const effectiveLayout = page.layout ?? layout;

  // Each ROW owns its own `EventSurface` (see RowRenderer), so a video never drives a panel in
  // another row — let alone another page block.
  return (
    <div ref={ref}>
      <BlockVisibilityContext.Provider value={isNear}>
        {effectiveLayout.rows.map((row, index) => (
          <RowRenderer key={row.id} row={row} dataMap={page.data} index={index} />
        ))}
      </BlockVisibilityContext.Provider>
    </div>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="gencl:flex gencl:w-full gencl:items-center gencl:justify-center gencl:p-6 gencl:text-secondary-500">
      {children}
    </div>
  );
}

const HOME_MOTION_CSS = `
/* Home's mobile top bar is fixed at z-index 9. Keep the SDK full view above it without
   changing the shared player or affecting expand views on other pages. */
[data-genuin-overlay-host][data-portal-key="expand-view"] { z-index: 50 !important; }

.gen-home-motion { scroll-behavior: smooth; }
.gen-home-row {
  opacity: 0;
  animation: gen-home-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--gen-home-delay, 0ms);
}
@keyframes gen-home-rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .gen-home-motion { scroll-behavior: auto; }
  .gen-home-row { opacity: 1; animation: none; }
}

/* A widget declaring an intrinsicSize (an SDK grid embed) draws at exactly that ratio, filling
   the width. Its CONTENT box therefore carries the ratio — the cell adds its section header on
   top — at every screen size, so the tiles never leave dead space below them nor spill past the
   section. The flex:none stops the frame's flex-1 from stretching it. */
.gen-home-grid > [data-fit="intrinsic"] .gen-widget-body {
  flex: none;
  aspect-ratio: var(--gen-widget-ratio);
}
/* In such a row the ratio widget alone decides the height. Its siblings are internally-scrolling
   panels whose natural content is far taller than any section; size containment keeps them out of
   the track calculation so they stretch to the ratio instead of dictating a 1400px row. */
.gen-home-grid[data-rows="ratio"] > :not([data-fit="intrinsic"]) { contain: size; }

/* Below the desktop breakpoint every row collapses to a single column, so the manifest's
   side-by-side cells stack in source order — exactly the reading order of the mobile design.
   The manifest's row height is a DESKTOP figure (one row of cells side by side); stacked, it
   becomes each cell's MINIMUM height instead, capped at 70vh so a tall row can never fill more
   than most of a phone screen. Everything here is an override of the renderer's inline styles,
   hence the !important flags — the layout contract itself is untouched. */
@media (max-width: 1023px) {
  /* The top bar is fixed and only desktop reserves room for it (base-layout sizes <main> at
     100% - 64px there), so the scroller pads itself by the bar's height on mobile. */
  .gen-home-motion { padding-top: 64px; }
  .gen-home-row { padding: 16px !important; }
  .gen-home-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    grid-template-rows: none !important;
    grid-auto-rows: auto;
    /* Stacked, the row is as tall as its cells — the desktop aspect-ratio sizing does not apply. */
    aspect-ratio: auto !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    row-gap: 24px !important;
  }
  /* A FIXED height per stacked cell, not min-height: the news/link panels scroll internally, so
     letting them grow to their content turned one row into ~3000px of page. Capped at 70vh so a
     tall row never exceeds most of a phone screen. */
  .gen-home-grid > * { height: min(var(--gen-home-cell-h, 420px), 70vh); }
  /* …except a widget that draws at its own ratio — it is sized by the base rule below. */
  .gen-home-grid > [data-fit="intrinsic"] { height: auto; }
  /* Desktop-only alignment spacer (keeps a headerless panel level with its neighbour's header);
     stacked, there is no neighbour to align to. */
  .gen-home-spacer { display: none; }
}
@media (max-width: 767px) {
  .gen-home-grid > [data-fit="intrinsic"] .gen-widget-body {
    aspect-ratio: var(--gen-widget-mobile-ratio, var(--gen-widget-ratio));
  }
}
`;

export function HomeDynamic() {
  const overlayBoundsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canAppendRef = useRef(false);
  const [playerOverlay, setPlayerOverlay] = useState<FeedViewOverlayRequest | null>(null);
  const closePlayerOverlay = useCallback(() => setPlayerOverlay(null), []);

  const layoutQuery = useHomeLayout();
  const feed = useHomeFeed();
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed;
  const pageCount = feed.data?.pages.length ?? 0;

  // Append the next page when the bottom sentinel enters the scroll container.
  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && canAppendRef.current && hasNextPage && !isFetchingNextPage) {
          canAppendRef.current = false;
          fetchNextPage();
        }
      },
      { root, rootMargin: "300px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Re-arm one frame after a page is added, once its reserved height has pushed the sentinel
  // back out of view — so one "reached the end" appends exactly one page.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      canAppendRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [pageCount]);

  const layout = layoutQuery.data;
  const pages = feed.data?.pages ?? [];
  const isInitialLoading = layoutQuery.isLoading || feed.isLoading;
  const isError = layoutQuery.isError || feed.isError || (!isInitialLoading && !layout);

  // ALWAYS render the scroll container so `scrollRef`/`sentinelRef` are attached from the very
  // first render — otherwise the infinite-scroll observer can miss them (its effect re-runs on
  // [hasNextPage,…], which may not change on the loading→loaded transition if the feed query
  // resolved before the layout query). Loading/error render INSIDE the container.
  return (
    <FeedViewOverlayProvider onOpen={setPlayerOverlay}>
      <div ref={overlayBoundsRef} className="gencl:relative gencl:h-full gencl:overflow-hidden">
        <div
          ref={scrollRef}
          aria-hidden={playerOverlay ? true : undefined}
          inert={playerOverlay ? true : undefined}
          className={`gen-home-motion gencl:h-full ${playerOverlay ? "gencl:overflow-hidden" : "gencl:overflow-auto"}`}>
          <style>{HOME_MOTION_CSS}</style>
          {layout &&
            pages.map((page) => (
              <PageBlock key={page.metadata.pageSession} page={page} layout={layout} rootRef={scrollRef} />
            ))}
          {isError ? <ErrorState type="ERROR" /> : isInitialLoading ? <HomeDynamicSkeleton /> : null}
          <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
          {isFetchingNextPage && <CenteredMessage>Loading more…</CenteredMessage>}
        </div>

        {playerOverlay && (
          <FeedViewOverlay request={playerOverlay} boundsRef={overlayBoundsRef} onClose={closePlayerOverlay} />
        )}
      </div>
    </FeedViewOverlayProvider>
  );
}
