import { useQuery } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForTrendingCommunities } from "@genuin/components/react-query/keys/community";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { AxiosInstance } from "axios";

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
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForTrendingCommunities(),
    queryFn: (context) => fetchTrendingCommunities(axiosInstance),
  });
}
