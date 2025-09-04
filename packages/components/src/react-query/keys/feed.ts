import { type QueryKey } from "@tanstack/react-query";

import type { FeedType } from "@genuin/components/types/post";
import { EmbedDataType } from "@genuin/components/context/embed/embed.types";

import { baseQueryKey } from "./base";

/**
 * This function generates a unique query key for the feed based on the feed type and options.
 * @param feedType - Type of feed (HOME, LATEST, POPULAR, EMBED_HOME, etc.)
 * @param options - Optional filter options for the feed
 * @returns QueryKey array
 */
export function getQueryKeyForFeed(
  feedType: FeedType,
  options?: {
    communityIds?: string[];
    groupIds?: string[];
    startVideoSlug?: string;
    enabled?: boolean;
    placementId?: string;
    styleId?: string;
    sectionId?: string;
    pageSession?: string;
    lastVideoId?: string;
    contextualParams?: EmbedDataType["contextualParams"];
    // Caching option
    staleTime?: number;
    gcTime?: number;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): QueryKey {
  if (!options) {
    return [...baseQueryKey, "feed", feedType];
  }

  // Create a sanitized options object for caching that excludes runtime-specific params
  const cacheableOptions = {
    ...(options.communityIds && { communityIds: options.communityIds }),
    ...(options.groupIds && { groupIds: options.groupIds }),
    ...(options.startVideoSlug && { startVideoSlug: options.startVideoSlug }),
    ...(options.placementId && { placementId: options.placementId }),
    ...(options.styleId && { styleId: options.styleId }),
    ...(options.sectionId && { sectionId: options.sectionId }),
    // Include contextual params for proper cache differentiation
    ...(options.contextualParams?.page_context && {
      pageContext: options.contextualParams.page_context,
    }),
    ...(options.contextualParams?.geo && {
      geo: options.contextualParams.geo,
    }),
    // Note: pageSession, lastVideoId, and caching options are excluded as they're 
    // pagination-specific or configuration-specific and should not affect the base query cache key
  };

  return Object.keys(cacheableOptions).length > 0
    ? [...baseQueryKey, "feed", feedType, cacheableOptions]
    : [...baseQueryKey, "feed", feedType];
}

/**
 * This function generates a unique query key for the group feed based on the group slug.
 * @param slug
 * @returns
 */
export function getQueryKeyForGroupFeed(slug: string): QueryKey {
  return [...baseQueryKey, "group-feed", slug];
}
