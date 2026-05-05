import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import type { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";
import { getQueryKeyForLinkouts } from "@genuin/components/react-query/keys/linkouts";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { validateLinkouts } from "./schema";

async function fetchLinkouts(axiosInstance: AxiosInstance, id?: number | null | undefined) {
  return await axiosInstance
    .get(API_PATHS.LINKOUTS, { params: { linkouts_ids: [id] } })
    .then((res) => {
      return validateLinkouts(res.data.data[0].linkouts);
    })
    .catch((e) => {
      throw new Error("Something went wrong while fetching linkouts.", e);
    });
}

export function useGetLinkouts(
  id?: number | null,
  options: Omit<UseQueryOptions<LinkoutsType>, "queryFn" | "queryKey" | "refetchOnWindowFocus" | "retry"> = {}
) {
  const axiosInstance = useAxiosInstance();

  return useQuery<LinkoutsType>({
    queryFn: async () => await fetchLinkouts(axiosInstance, id),
    queryKey: getQueryKeyForLinkouts(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    retry: 0,
    ...options,
  });
}
