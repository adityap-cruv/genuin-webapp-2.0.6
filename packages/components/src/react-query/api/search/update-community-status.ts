import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import type { CommunityUserRole } from "@genuin/components/types/post";

import { queryClient } from "../../client";
import { getQueryKeyForCommunityDetails, getQueryKeyForTrendingCommunities } from "../../keys/community";
import { getQueryKeyForFeed } from "../../keys/feed";
import { getQueryKeyForTopResults } from "../../keys/search";
import { setQueryDataForJoinCommunityStatusInFeed } from "../feed/feed";

import type { TopResultsResponseType } from "./types";

/**
 * Updates the community join status in the search results and other relevant pages.
 * This function updates the cached data when a user joins or leaves a community,
 * ensuring consistent state across multiple parts of the application.
 *
 * @param query - The search query used to fetch the results
 * @param communityId - The ID of the community (community_id)
 * @param newRole - The new role of the user in the community
 * @param pathname - The current page pathname to determine which queries to update
 */
export function updateCommunityJoinStatusInSearchResults({
  query,
  communityId,
  newRole,
  pathname,
  slug,
}: {
  query: string;
  communityId: string;
  newRole: CommunityUserRole;
  pathname?: string;
  slug?: string;
}) {
  // Always update the search results cache
  updateSearchResults(query, communityId, newRole);

  // If pathname is provided, update relevant page-specific data
  if (pathname) {
    // Handle feed pages (home, popular, latest)
    if (
      pathname === buildPageUrl({ type: "home" }) ||
      pathname === buildPageUrl({ type: "popular" }) ||
      pathname === buildPageUrl({ type: "latest" })
    ) {
      updateFeedPageData(pathname, communityId, newRole);
    }
    // Handle community pages
    else if (pathname === buildPageUrl({ type: "community", slug })) {
      if (slug) {
        invalidateCommunityDetails(slug);
      }
    }
    // Handle explore page
    else if (pathname === buildPageUrl({ type: "explore" })) {
      invalidateTrendingCommunities();
    }
  }
}

/**
 * Updates the community join status in search results
 * @param query The search query
 * @param communityId The ID of the community to update
 * @param newRole The new role of the user in the community
 */
function updateSearchResults(query: string, communityId: string, newRole: CommunityUserRole) {
  // Get the query key for the top results
  const queryKey = getQueryKeyForTopResults(query);

  // Update the data in the query cache
  queryClient.setQueryData(
    queryKey,
    (oldData: TopResultsResponseType | undefined): TopResultsResponseType | undefined => {
      if (!oldData) return oldData;

      // Create a deep copy of the data
      const newData = {
        ...oldData,
        communities: oldData.communities.map((community) => {
          if (community.community_id === communityId) {
            // Update the community join status based on the new role
            let newRoleNumber: number | undefined;
            let isRequested = false;

            // Map the CommunityUserRole to the correct logged_in_user_role value
            // and is_community_join_requested flag
            switch (newRole) {
              case "LEADER":
                newRoleNumber = 1;
                break;
              case "MEMBER":
                newRoleNumber = 2;
                break;
              case "MODERATOR":
                newRoleNumber = 3;
                break;
              case "REQUESTED":
                isRequested = true;
                break;
              case "UNJOINED":
                newRoleNumber = undefined;
                break;
              default:
                newRoleNumber = undefined;
            }

            return {
              ...community,
              logged_in_user_role: newRoleNumber,
              is_community_join_requested: isRequested,
            };
          }
          return community;
        }),
      };

      return newData;
    }
  );
}

/**
 * Updates the feed data for home, recent, or latest pages
 * @param pathname The current pathname to determine the feed type
 * @param communityId The ID of the community to update
 * @param newRole The new role of the user in the community
 */
function updateFeedPageData(pathname: string, communityId: string, newRole: CommunityUserRole) {
  // Extract the feed type from the pathname
  // Remove the leading slash and convert to uppercase for FeedType
  const feedType = pathname.substring(1).toUpperCase();

  // Get the query key for the feed
  const queryKey = getQueryKeyForFeed(feedType as any);

  // Update the feed data with the new community status
  setQueryDataForJoinCommunityStatusInFeed({
    queryKey,
    communityId,
    newRole,
  });
}

/**
 * Invalidates the community details query for a specific community slug
 * @param slug The slug of the community
 */
function invalidateCommunityDetails(slug: string) {
  // Invalidate the query to force a refetch with the updated data
  queryClient.invalidateQueries({
    queryKey: getQueryKeyForCommunityDetails(slug),
  });
}

/**
 * Invalidates the trending communities query for the explore page
 */
function invalidateTrendingCommunities() {
  // Invalidate the query to force a refetch with the updated data
  queryClient.invalidateQueries({
    queryKey: getQueryKeyForTrendingCommunities(),
  });
}
