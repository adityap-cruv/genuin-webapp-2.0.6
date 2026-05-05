import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForCommunityMembers } from "@genuin/components/react-query/keys/community";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { validateCommunityMembers } from "./schema";

async function fetchCommunityMembers(slug: string, axiosInstance: AxiosInstance) {
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
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryFn: async (_context) => await fetchCommunityMembers(slug, axiosInstance),
    queryKey: getQueryKeyForCommunityMembers(slug),
  });
}
