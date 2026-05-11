import React from "react";

/**
 * Generic cell renderer for video stats columns (views, sparks, shares, comments).
 * Handles loading state and displays the stat value or a skeleton.
 *
 * @param {object} props
 * @param {string} props.statKey - The key in stats object to display (e.g., 'no_of_views')
 * @param {object} props.row - Row object from TanStack table
 * @param {object} props.table - Table instance from TanStack table
 * @param {string} [props.className] - Optional className for the wrapper
 */
export function StatsCell({
  statKey,
  row,
  table,
  className = "",
}: {
  statKey: string;
  row: any;
  table: any;
  className?: string;
}) {
  const postId = row.original.video.id;
  const meta = table.options.meta as any;
  const stats = meta?.videoStats?.[postId];
  const isLoading = meta?.statsLoading;

  // Show loading if stats are being loaded AND this specific post doesn't have stats yet
  if (isLoading && (!meta?.videoStats || !meta.videoStats[postId])) {
    return (
      <div className={`gencl:flex gencl:items-center gencl:justify-center ${className}`}>
        <div className="gencl:w-6 gencl:h-3 gencl:bg-secondary-200 gencl:rounded gencl:animate-pulse"></div>
      </div>
    );
  }

  // If stats are available for this post, show the stat value
  if (stats && typeof stats === "object") {
    return (
      <div className={`gencl:flex gencl:items-center gencl:justify-center ${className}`}>
        <span className="gencl:text-body-1-medium">{stats[statKey] || 0}</span>
      </div>
    );
  }

  // Fallback: show 0 if no stats available (not loading, but no data)
  return (
    <div className={`gencl:flex gencl:items-center gencl:justify-center ${className}`}>
      <span className="gencl:text-body-1-medium">0</span>
    </div>
  );
}
