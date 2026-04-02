import { useQuery } from "@tanstack/react-query";
import { useAxiosInstance } from "@genuin/components/context/axios";
import { getQueryKeyForLocations } from "@genuin/components/react-query/keys/locations";
import { API_PATHS } from "@genuin/components/react-query/paths";
import type { AxiosInstance } from "axios";

type fetchLocationParams = {
  query: string;
  latitude?: number;
  longitude?: number;
};

async function fetchLocations({ query, ...params }: fetchLocationParams, axiosInstance: AxiosInstance) {
  return await axiosInstance
    .get(API_PATHS.LOCATIONS_SEARCH, {
      params: { query_string: query, ...params },
    })
    .then((response) => {
      return response?.data?.data;
    })
    .catch(() => {
      throw new Error("Something went wrong in fetching locations.");
    });
}

export function useLocations(params: fetchLocationParams) {
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForLocations(params.query),
    queryFn: (context) => fetchLocations(params, axiosInstance),
    enabled: params.query.trim().length >= 3,
  });
}
