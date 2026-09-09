import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

/**
 * A video's linkouts as a clean array. `video.linkouts` is typed `z.any()`
 * upstream, so this narrows once and every caller gets a real array or `[]`.
 */
export function getLinkouts(video: { linkouts?: unknown } | null | undefined): LinkData[] {
  return Array.isArray(video?.linkouts) ? (video.linkouts as LinkData[]) : [];
}

/**
 * Whether `video` has at least one linkout. Type guard so callers keep the
 * narrowing the old inline `Array.isArray(video?.linkouts)` check gave them —
 * `video` is defined and `video.linkouts` is a `LinkData[]` in the true branch.
 */
export function hasLinkouts<T extends { linkouts?: unknown }>(
  video: T | null | undefined
): video is T & { linkouts: LinkData[] } {
  return getLinkouts(video).length > 0;
}
