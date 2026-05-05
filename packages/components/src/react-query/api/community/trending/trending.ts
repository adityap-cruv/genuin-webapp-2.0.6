import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForTrendingCommunities } from "@genuin/components/react-query/keys/community";
import { API_PATHS } from "@genuin/components/react-query/paths";

async function fetchTrendingCommunities(axiosInstance: AxiosInstance) {
  return await axiosInstance
    .get(API_PATHS.TRENDING_COMMUNITIES)
    .then((res) => {
      const resData = res.data.data;
      return resData;
    })
    .catch(() => {
      throw new Error("Something went wrong in fetching trending communities.");
    });
}

export function getTrendingCommunities() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const axiosInstance = useAxiosInstance();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery({
    queryKey: getQueryKeyForTrendingCommunities(),
    queryFn: (_context) => fetchTrendingCommunities(axiosInstance),
  });
}
