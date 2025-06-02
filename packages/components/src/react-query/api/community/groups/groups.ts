import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "src/react-query/axios-instance";
import { getQueryKeyForCommunityGroups } from "src/react-query/keys/community";
import { API_PATHS } from "src/react-query/paths";

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
      return { loops: validateCommunityGroups(res.data.data.conversations) };
    })
    .catch(() => {
      throw new Error("Something went wrong with loop community.!");
    });
}

export function useGetCommunityGroups(slug: string) {
  return useQuery({
    queryFn: async () => await fetchCommunityGroups(slug),
    queryKey: getQueryKeyForCommunityGroups(slug),
  });
}
