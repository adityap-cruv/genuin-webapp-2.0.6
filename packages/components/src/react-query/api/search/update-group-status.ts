import { queryClient } from "../../client";
import { getQueryKeyForTopResults } from "../../keys/search";
import { TopResultsResponseType } from "./types";
import { GroupUserStatusType } from "@genuin/components/types/roles";

/**
 * Updates the group join status in the search results.
 * This function updates the cached search results data when a user joins or leaves a group.
 *
 * @param query - The search query used to fetch the results
 * @param groupId - The ID of the group (chat_id)
 * @param newRole - The new role of the user in the group
 */
export function updateGroupJoinStatusInSearchResults(
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
