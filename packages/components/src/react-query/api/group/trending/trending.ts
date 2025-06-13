import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForTrendingGroups } from "@react-query/keys/group";
import { API_PATHS } from "@react-query/paths";
import { useQuery } from "@tanstack/react-query";

async function fetchTrendingGroups() {
  return await axiosInstance
    .get(API_PATHS.TRENDING_GROUPS)
    .then((res) => {
      const resData = res.data.data;
      return { groups: resData.loops };
    })
    .catch(() => {
      throw new Error("Something went wrong in fetching trending communities.");
    });
}

export function getTrendingGroups() {
  return useQuery({
    queryKey: getQueryKeyForTrendingGroups(),
    queryFn: () => fetchTrendingGroups(),
  });
}
