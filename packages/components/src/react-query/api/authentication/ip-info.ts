import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "../../paths";
import { getQueryKeyForIpInfo } from "../../keys/ip-info";
import type { AxiosInstance } from "axios";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

type Response = {
  city: string;
  country: string;
  ip: string;
  latitude: number;
  location: string;
  longitude: number;
  postal: string;
  region: string;
  timezone: string;
};

async function fetchIpInfo<T>(axiosInstance: AxiosInstance): Promise<T> {
  try {
    const response = await axiosInstance.get(API_PATHS.FETCH_IP_INFO);
    return response.data;
  } catch (error: any) {
    console.error("IP Info API Error:", error.response?.data?.code);
    throw new Error(
      `Failed to fetch IP Info: ${error.response?.data?.message || "Unknown error"}`
    );
  }
}

/**
 * React hook for fetching IP geolocation information
 * @returns Query result containing IP geolocation data
 */
export function useIpInfo<T extends Response>(): UseQueryResult<T> {
  const axiosInstance = useAxiosInstance();

  return useQuery<T>({
    queryKey: getQueryKeyForIpInfo(),
    queryFn: () => fetchIpInfo<T>(axiosInstance),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
