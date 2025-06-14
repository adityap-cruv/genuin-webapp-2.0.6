import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { getQueryKeyForTrendingCommunities } from "@genuin/components/react-query/keys/community";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { useQuery } from "@tanstack/react-query";

async function fetchTrendingCommunities() {
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
  return useQuery({
    queryKey: getQueryKeyForTrendingCommunities(),
    queryFn: () => fetchTrendingCommunities(),
  });
}
