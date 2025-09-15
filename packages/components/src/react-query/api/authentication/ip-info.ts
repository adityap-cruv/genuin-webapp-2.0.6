import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance } from "../../axios-instance";
import { API_PATHS } from "../../paths";
import { getQueryKeyForIpInfo } from "../../keys/ip-info";

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

async function fetchIpInfo<T>(): Promise<T> {
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
  return useQuery<T>({
    queryKey: getQueryKeyForIpInfo(),
    queryFn: () => fetchIpInfo<T>(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
