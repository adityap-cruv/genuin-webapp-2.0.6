import { type QueryKey } from "@tanstack/react-query";

import type { FeedType } from "@genuin/components/types/post";

import { baseQueryKey } from "./base";

/**
 * Behavioral/react-query options that configure *how* a query runs, not *what*
 * data it identifies. These must never affect cache identity — two calls that
 * differ only in `staleTime` (say) should hit the same cache entry, and a
 * server-seeded query (which never sets these) must produce the same key as
 * the client hook that does.
 */
const BEHAVIORAL_OPTION_KEYS = new Set([
  "staleTime",
  "gcTime",
  "refetchOnMount",
  "refetchOnWindowFocus",
  "refetchOnReconnect",
  "enabled",
  "placeholderData",
  "retry",
]);

/**
 * This function generates a unique query key for the feed based on the feed type and options.
 * @param feedType - Type of feed (HOME, LATEST, POPULAR, EMBED_HOME, etc.)
 * @param options - Optional filter options for the feed. Behavioral/react-query
 *   options (`staleTime`, `refetchOnMount`, `enabled`, ...) are excluded from
 *   the key — only data-identifying options affect cache identity.
 * @returns QueryKey array
 */
export function getQueryKeyForFeed(feedType: FeedType, options?: Record<string, any>): QueryKey {
  // Convert options object to an array of strings in the format "key-value"
  // This ensures proper cache key serialization for React Query
  const optionsArray = options
    ? Object.entries(options)
        .filter(([key]) => !BEHAVIORAL_OPTION_KEYS.has(key))
        .map(([key, value]) => {
          // Handle complex values (objects, arrays) by stringifying them
          // Primitive values are converted directly to strings
          const stringValue = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
          // Format: "key-value" (e.g., "category-tech", "filter-{\"active\":true}")
          return `${key}-${stringValue}`;
        })
    : [];

  // Spread the options array into the query key for proper cache differentiation
  return [...baseQueryKey, "feed", feedType, ...optionsArray];
}

/**
 * This function generates a partial query key for feed queries.
 * Use this to match all feed queries or all queries of a specific feed type.
 * @param feedType - Optional feed type to narrow down the match
 * @returns Partial QueryKey array that matches all feed queries (or specific feed type)
 * @example
 * // Match all feed queries
 * getPartialQueryKeyForFeed()
 *
 * // Match all HOME feed queries
 * getPartialQueryKeyForFeed('HOME')
 */
export function getPartialQueryKeyForFeed(feedType?: FeedType): QueryKey {
  if (feedType) {
    return [...baseQueryKey, "feed", feedType];
  }
  return [...baseQueryKey, "feed"];
}

/**
 * This function generates a unique query key for the group feed based on the group slug.
 * @param slug
 * @returns
 */
export function getQueryKeyForGroupFeed(slug: string): QueryKey {
  return [...baseQueryKey, "group-feed", slug];
}
