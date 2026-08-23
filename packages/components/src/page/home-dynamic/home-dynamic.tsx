"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

import { ErrorState } from "@genuin/components/molecules/error-state";

import { BlockVisibilityContext, COMPONENT_REGISTRY, WidgetBusProvider } from "./component-registry";
import type {
  ColumnNode,
  HomeDataPage,
  HomeLayoutManifest,
  LayoutNode,
  LayoutRow,
  WidgetData,
  WidgetNode,
} from "./contract";
import { useHomeFeed, useHomeLayout } from "./use-home-data";

// ─── Layout renderer (walks the BFF layout tree, joins widgets to content by dataKey) ────
// Consolidated here from the former layout-renderer.tsx.

type DataMap = Record<string, WidgetData>;

/** One widget filling its grid cell; the registry entry adapts the data to a component. */
function WidgetRenderer({ node, dataMap }: { node: WidgetNode; dataMap: DataMap }) {
  const data = dataMap[node.dataKey];
  const Entry = COMPONENT_REGISTRY[node.component];
  // Skip gracefully on missing data / unknown component (forward-compatible with a backend
  // that ships content or components an older client doesn't know yet).
  if (!data || !Entry) return null;
  return (
    <div className="gencl:min-h-0 gencl:min-w-0">
      <Entry node={node} data={data} dataMap={dataMap} />
    </div>
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
 * One row: a CSS grid with the manifest's explicit column template and a fixed content height
 * (matching /home per-section). The single row track fills that height so cells stretch.
 */
function RowRenderer({ row, dataMap }: { row: LayoutRow; dataMap: DataMap }) {
  return (
    <div className="gencl:w-full" style={{ padding: 24 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: row.gridTemplateColumns,
          gridTemplateRows: "minmax(0, 1fr)",
          height: row.height,
          gap: row.gap ?? 16,
          columnGap: row.columnGap,
          alignItems: "stretch",
        }}>
        {row.children.map((child) => (
          <NodeRenderer key={child.id} node={child} dataMap={dataMap} />
        ))}
      </div>
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
    const observer = new IntersectionObserver(
      (entries) => setIsNear(entries[0]?.isIntersecting ?? false),
      { root: rootRef.current, rootMargin: "1200px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef]);

  // Own bus per page so page 1's carousel never drives page 2's panels.
  return (
    <div ref={ref}>
      <BlockVisibilityContext.Provider value={isNear}>
        <WidgetBusProvider>
          {layout.rows.map((row) => (
            <RowRenderer key={row.id} row={row} dataMap={page.data} />
          ))}
        </WidgetBusProvider>
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

export function HomeDynamic() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canAppendRef = useRef(false);

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
    <div ref={scrollRef} className="gencl:h-full gencl:overflow-auto">
      {layout &&
        pages.map((page) => (
          <PageBlock key={page.metadata.pageSession} page={page} layout={layout} rootRef={scrollRef} />
        ))}
      {isError ? (
        <ErrorState type="ERROR" />
      ) : isInitialLoading ? (
        <CenteredMessage>Loading…</CenteredMessage>
      ) : null}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
      {isFetchingNextPage && <CenteredMessage>Loading more…</CenteredMessage>}
    </div>
  );
}
