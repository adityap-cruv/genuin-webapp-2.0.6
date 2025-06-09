import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForCommunityGroups } from "@react-query/keys/community";
import { API_PATHS } from "@react-query/paths";

import { validateCommunityGroups } from "./schema";

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
