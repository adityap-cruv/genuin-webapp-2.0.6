import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForCommunityGroups } from "@react-query/keys/community";
import { API_PATHS } from "@react-query/paths";

import { validateCommunityGroups } from "./schema";
import { queryClient } from "@react-query/client";
import { GroupUserStatusType } from "@types/roles";

export async function fetchCommunityGroups(slug: string) {
  return await axiosInstance
    .get(API_PATHS.COMMUNITY_GROUPS, {
      params: {
        slug,
        position: true,
      },
    })
    .then((res) => {
      return { groups: validateCommunityGroups(res.data.data.conversations) };
    })
    .catch(() => {
      throw new Error("Something went wrong with loop community.!");
    });
}

// TODO: think about adding a lazy loading for community groups.
export function useGetCommunityGroups(slug: string) {
  return useQuery({
    queryFn: async () => await fetchCommunityGroups(slug),
    queryKey: getQueryKeyForCommunityGroups(slug),
  });
}

/**
 * Sets the join status for a community group in the query data.
 * This function updates the query data for community groups to reflect the join status of a specific group.
 * It modifies the `logged_in_user_status` property of the group with the given `chatId`.
 * @param chatId
 * @param slug
 * @param newRole
 */
export function setQueryDataForJoinGroupStatusInCommunityGroups(
  chatId: string,
  slug: string,
  newRole: GroupUserStatusType
) {
  type QueryData = ReturnType<typeof useGetCommunityGroups>["data"];
  queryClient.setQueryData(
    getQueryKeyForCommunityGroups(slug),
    (oldData: QueryData): QueryData => {
      if (!oldData) return { groups: [] };
      return {
        groups: oldData.groups.map((group) =>
          group.chat_id === chatId
            ? {
                ...group,
                is_subscriber:
                  newRole === "JOINED" ? true : group.is_subscriber,
                logged_in_user_status: newRole,
              }
            : group
        ),
      };
    }
  );
}

/**
 * Sets the subscription status for a community group in the query data.
 * This function updates the query data for community groups to reflect the subscription status of a specific group.
 * It modifies the `is_subscriber` property of the group with the given `chatId`.
 * @param chatId
 * @param slug
 * @param isSubscribed
 */
export function setQueryDataForSubscriptionStatusInCommunityGroups(
  chatId: string,
  slug: string,
  isSubscribed: boolean
) {
  type QueryData = ReturnType<typeof useGetCommunityGroups>["data"];
  queryClient.setQueryData(
    getQueryKeyForCommunityGroups(slug),
    (oldData: QueryData): QueryData => {
      if (!oldData) return { groups: [] };
      return {
        groups: oldData.groups.map((group) =>
          group.chat_id === chatId
            ? { ...group, is_subscriber: isSubscribed }
            : group
        ),
      };
    }
  );
}
