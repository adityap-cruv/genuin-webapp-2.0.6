import { useQuery } from "@tanstack/react-query";

import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@react-query/axios-instance";
import { getQueryKeyForLoopDetails } from "@react-query/keys/group";
import { API_PATHS } from "@react-query/paths";

import { parseGroupDetails } from "./parser";

async function fetchLoopDetails(slug: string) {
  try {
    const response = await axiosInstance.get(API_PATHS.GROUP_DETAILS, {
      params: { slug },
    });
    return parseGroupDetails(response?.data?.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response?.data?.code === NOT_FOUND_ERROR_CODES.group) {
      throw new Error(NOT_FOUND_ERROR_CODES.group);
    }
    throw new Error("Something went wrong!!");
  }
}

/**
 * Custom hook to fetch group details.
 * @param slug - The unique identifier for the group.
 * @returns An object containing the query key and query function.
 */
export function useGetGroupDetails(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForLoopDetails(slug),
    queryFn: () => fetchLoopDetails(slug),
  });
}
