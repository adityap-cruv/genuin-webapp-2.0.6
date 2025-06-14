import { useQuery } from "@tanstack/react-query";

import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { getQueryKeyForLoopDetails } from "@genuin/components/react-query/keys/group";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { parseGroupDetails } from "./parser";
import { queryClient } from "@genuin/components/react-query/client";
import { GroupUserStatusType } from "@genuin/components/types/roles";

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

/**
 * Sets the query data for joining a group in the group details.
 * @param slug - The unique identifier for the group.
 * @param role
 */
export function setQueryDataForJoinGroupInGroupDetails(
  slug: string,
  role: GroupUserStatusType
) {
  type QueryData = ReturnType<typeof useGetGroupDetails>["data"];

  queryClient.setQueryData(
    getQueryKeyForLoopDetails(slug),
    (oldData: QueryData): QueryData => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        isSubscriber: role === "JOINED" ? true : oldData.isSubscriber,
        role,
      };
    }
  );
}

/**
 * Sets the query data for subscribing to a group in the group details.
 * @param slug - The unique identifier for the group.
 * @param isSubscriber - Whether the user is a subscriber or not.
 */
export function setQueryDataForSubscribeGroupInGroupDetails(
  slug: string,
  isSubscriber: boolean
) {
  type QueryData = ReturnType<typeof useGetGroupDetails>["data"];

  queryClient.setQueryData(
    getQueryKeyForLoopDetails(slug),
    (oldData: QueryData): QueryData => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        isSubscriber,
      };
    }
  );
}
