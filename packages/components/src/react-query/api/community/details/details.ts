import { useQuery } from "@tanstack/react-query";

import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForCommunityDetails } from "@react-query/keys/community";
import { API_PATHS } from "@react-query/paths";

import { CommunityDetailsType, validateCommunityDetails } from "./schema";
import { queryClient } from "@react-query/client";
import { CommunityUserRole } from "@types/post";

async function fetchCommunityDetails(slug: string) {
  return await axiosInstance
    .get(API_PATHS.COMMUNITY_DETAILS, {
      params: {
        slug,
      },
    })
    .then((res) => {
      return validateCommunityDetails(res.data.data);
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.community) {
        throw new Error(e.response.data.code);
      }
      throw new Error("Something went wrong with community detail!");
    });
}

/**
 * Custom hook to fetch community details.
 * @param slug - The slug of the community for which details are being fetched.
 * @returns A query object containing the community details.
 */
export function useGetCommunityDetails(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForCommunityDetails(slug),
    queryFn: async () => await fetchCommunityDetails(slug),
  });
}

/**
 * Updates the query data for a community role change.
 * @param slug - The slug of the community for which the role is being changed.
 * @param newRole - The new role of the logged-in user in the community.
 */
export function setQueryDataForCommunityRoleChange(
  slug: string,
  newRole: CommunityUserRole
) {
  queryClient.setQueryData<CommunityDetailsType>(
    getQueryKeyForCommunityDetails(slug),
    (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        logged_in_user_role: newRole,
      };
    }
  );
}
