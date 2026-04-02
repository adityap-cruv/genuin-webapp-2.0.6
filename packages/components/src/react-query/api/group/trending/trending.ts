import { useQuery } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForTrendingGroups } from "@genuin/components/react-query/keys/group";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { AxiosInstance } from "axios";

async function fetchTrendingGroups(axiosInstance: AxiosInstance) {
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
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForTrendingGroups(),
    queryFn: (context) => fetchTrendingGroups(axiosInstance),
  });
}
