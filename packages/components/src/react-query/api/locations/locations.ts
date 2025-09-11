import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { getQueryKeyForLocations } from "@genuin/components/react-query/keys/locations";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { useQuery } from "@tanstack/react-query";

type fetchLocationParams = {
  query: string;
  latitude?: number;
  longitude?: number;
};

async function fetchLocations({ query, ...params }: fetchLocationParams) {
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
  return useQuery({
    queryKey: getQueryKeyForLocations(params.query),
    queryFn: () => fetchLocations(params),
    enabled: params.query.trim().length >= 3,
  });
}
