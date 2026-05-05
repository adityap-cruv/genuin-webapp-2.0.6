import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForTrendingGroups } from "@genuin/components/react-query/keys/group";
import { API_PATHS } from "@genuin/components/react-query/paths";

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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const axiosInstance = useAxiosInstance();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery({
    queryKey: getQueryKeyForTrendingGroups(),
    queryFn: (_context) => fetchTrendingGroups(axiosInstance),
  });
}
