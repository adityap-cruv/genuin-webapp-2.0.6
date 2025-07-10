import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { useQuery } from "@tanstack/react-query";
import { getQueryKeyForNotificationCount } from "../../keys/notification";

/**
 * Response type for notification count API
 */
export interface NotificationCountResponse {
  status: boolean;
  count: number;
}

/**
 * Fetches the notification count. In case of error it throws an error to be handled by React Query.
 * @returns NotificationCountResponse containing status and count
 */
export async function fetchNotificationCount(): Promise<NotificationCountResponse> {
  return await axiosInstance
    .get("/api/v3/notification_count")
    .then((res) => {
      return { status: res.status === 200, count: res?.data?.data?.count };
    })
    .catch((e) => {
      throw new Error("Failed to fetch notification count", { cause: e });
    });
}

/**
 * React Query hook for fetching notification count
 * @param options Additional React Query options
 * @returns Query result with notification count data
 */
export function useNotificationCount(
  options: Omit<
    Parameters<typeof useQuery>[0],
    "queryFn" | "queryKey" | "refetchOnWindowFocus"
  > = {}
) {
  return useQuery({
    queryFn: fetchNotificationCount,
    queryKey: getQueryKeyForNotificationCount(),
    refetchOnWindowFocus: true,
    // Default to 5 minute staleTime to reduce unnecessary refetches
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}
