import { queryClient } from "../../client";
import { getQueryKeyForTopResults } from "../../keys/search";
import { TopResultsResponseType } from "./types";
import { CommunityUserRole } from "@genuin/components/types/post";

/**
 * Updates the community join status in the search results.
 * This function updates the cached search results data when a user joins or leaves a community.
 *
 * @param query - The search query used to fetch the results
 * @param communityId - The ID of the community (community_id)
 * @param newRole - The new role of the user in the community
 */
export function updateCommunityJoinStatusInSearchResults(
  query: string,
  communityId: string,
  newRole: CommunityUserRole
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
