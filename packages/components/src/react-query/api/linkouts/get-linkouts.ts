import { axiosInstance } from "@react-query/axios-instance";
import { useQuery } from "@tanstack/react-query";
import { validateLinkouts } from "./schema";
import { getQueryKeyForLinkouts } from "@react-query/keys/linkouts";
import { API_PATHS } from "@react-query/paths";

export async function fetchLinkouts(id: number) {
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
  id: number,
  options: Omit<
    Parameters<typeof useQuery>[0],
    "queryFn" | "queryKey" | "refetchOnWindowFocus" | "retry"
  > = {}
) {
  return useQuery({
    queryFn: async () => await fetchLinkouts(id),
    queryKey: getQueryKeyForLinkouts(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    retry: 0,
    ...options,
  });
}
