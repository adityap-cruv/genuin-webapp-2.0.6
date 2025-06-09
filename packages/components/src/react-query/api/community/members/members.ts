import { useQuery } from "@tanstack/react-query";

import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForCommunityMembers } from "@react-query/keys/community";
import { API_PATHS } from "@react-query/paths";

import { validateCommunityMembers } from "./schema";

async function fetchCommunityMembers(slug: string) {
  return await axiosInstance
    .get(API_PATHS.COMMUNITY_MEMBERS, {
      params: {
        slug,
      },
    })
    .then((res) => {
      const resData = res.data.data;
      return { members: validateCommunityMembers(resData?.members) };
    })
    .catch(() => {
      throw new Error("Something went wrong in fetching community members.");
    });
}

// TODO think about adding a lazy loading for community members.
/**
 * Hook to fetch community members.
 * @param slug
 * @returns
 */
export function useGetCommunityMembers(slug: string) {
  return useQuery({
    queryFn: async () => await fetchCommunityMembers(slug),
    queryKey: getQueryKeyForCommunityMembers(slug),
  });
}
