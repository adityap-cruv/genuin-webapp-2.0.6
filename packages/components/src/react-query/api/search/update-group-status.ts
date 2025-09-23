import { queryClient } from "../../client";
import { getQueryKeyForTopResults } from "../../keys/search";
import { TopResultsResponseType } from "./types";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { getQueryKeyForFeed } from "../../keys/feed";
import { setQueryDataForJoinGroupStatusInFeed } from "../feed/feed";
import { setQueryDataForGroupJoinStatusInProfileGroups } from "../profile/posts/posts";
import { setQueryDataForJoinGroupStatusInCommunityGroups } from "../community/groups";
import { getQueryKeyForLoopDetails } from "../../keys/group";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

/**
 * Updates the group join status in the search results and other relevant pages.
 * This function updates the cached search results data when a user joins or leaves a group,
 * ensuring consistent state across multiple parts of the application.
 *
 * @param query - The search query used to fetch the results
 * @param groupId - The ID of the group (chat_id)
 * @param newRole - The new role of the user in the group
 * @param pathname - The current page pathname to determine which queries to update
 */
export function updateGroupJoinStatusInSearchResults({
  communityId,
  groupId,
  newRole,
  query,
  pathname,
  slug,
}: {
  query: string;
  groupId: string;
  communityId: string;
  newRole: GroupUserStatusType;
  pathname?: string;
  slug?: string;
}) {
  // Always update the search results cache
  updateSearchResults(query, groupId, newRole);

  // If pathname is provided, update relevant page-specific data
  if (pathname) {
    // Handle feed pages (home, popular, latest)
    if (
      pathname === buildPageUrl({ type: "home" }) ||
      pathname === buildPageUrl({ type: "popular" }) ||
      pathname === buildPageUrl({ type: "latest" })
    ) {
      updateFeedPageData(pathname, groupId, newRole);
    }
    // Handle group pages
    else if (pathname === buildPageUrl({ type: "group", slug })) {
      if (slug) invalidateGroupDetails(slug);
    }
    // Handle profile pages
    else if (pathname.startsWith(buildPageUrl({ type: "profile", asRoutePattern: true }).replace(":slug", ""))) {
      updateProfileGroupsData(communityId, groupId, newRole, false);
    }
    // Handle brand pages
    else if (pathname.startsWith(buildPageUrl({ type: "brand", asRoutePattern: true }).replace(":slug", ""))) {
      updateProfileGroupsData(communityId, groupId, newRole, true);
    }
    // Handle community pages
    else if (pathname.startsWith(buildPageUrl({ type: "community", asRoutePattern: true }).replace(":slug", ""))) {
      if (slug) updateCommunityGroupsData(slug, groupId, newRole);
    }
  }
}

/**
 * Updates the group join status in search results
 */
function updateSearchResults(
  query: string,
  groupId: string,
  newRole: GroupUserStatusType
) {
  // Get the query key for the top results
  const queryKey = getQueryKeyForTopResults(query);

  // Update the data in the query cache
  queryClient.setQueryData(
    queryKey,
    (
      oldData: TopResultsResponseType | undefined
    ): TopResultsResponseType | undefined => {
      if (!oldData) return oldData;

      // Create a deep copy of the data
      const newData = {
        ...oldData,
        loops: oldData.loops.map((loop) => {
          if (loop.chat_id === groupId) {
            // Update the logged_in_user_status based on the new role
            let newStatus: number | undefined;

            // Map the GroupUserStatusType to the correct logged_in_user_status value
            switch (newRole) {
              case "JOINED":
                newStatus = 3; // JOINED status
                break;
              case "REQUESTED":
                newStatus = 2; // REQUESTED status
                break;
              case "UNJOINED":
                newStatus = 1; // UNJOINED status
                break;
              default:
                newStatus = 1;
            }

            return {
              ...loop,
              logged_in_user_status: newStatus,
            };
          }
          return loop;
        }),
      };

      return newData;
    }
  );
}

/**
 * Updates the feed data for home, recent, or latest pages
 */
function updateFeedPageData(
  pathname: string,
  groupId: string,
  newRole: GroupUserStatusType
) {
  // Extract the feed type from the pathname
  // Remove the leading slash and convert to uppercase for FeedType
  const feedType = pathname.substring(1).toUpperCase();

  // Get the query key for the feed
  const queryKey = getQueryKeyForFeed(feedType as any);

  // Update the feed data with the new group status
  setQueryDataForJoinGroupStatusInFeed({
    queryKey,
    groupId,
    newRole,
  });
}

/**
 * Invalidates the group details query for a specific group slug
 */
function invalidateGroupDetails(slug: string) {
  // Invalidate the query to force a refetch with the updated data
  queryClient.invalidateQueries({
    queryKey: getQueryKeyForLoopDetails(slug),
  });
}

/**
 * Updates the profile or brand groups data
 * @param slug The profile or brand slug
 * @param groupId The group ID
 * @param newRole The new role of the user in the group
 * @param forBrand Whether this is for a brand profile (true) or user profile (false)
 */
function updateProfileGroupsData(
  communityId: string,
  groupId: string,
  newRole: GroupUserStatusType,
  forBrand: boolean = false
) {
  // Update the profile/brand groups data with the new group status
  setQueryDataForGroupJoinStatusInProfileGroups({
    communityId,
    loopId: groupId,
    forBrand,
    newRole,
  });
}

/**
 * Updates the community groups data
 * @param communitySlug The community slug
 * @param groupId The group ID
 * @param newRole The new role of the user in the group
 */
function updateCommunityGroupsData(
  communitySlug: string,
  groupId: string,
  newRole: GroupUserStatusType
) {
  // Update the community groups data with the new group status
  setQueryDataForJoinGroupStatusInCommunityGroups(
    groupId,
    communitySlug,
    newRole
  );
}
