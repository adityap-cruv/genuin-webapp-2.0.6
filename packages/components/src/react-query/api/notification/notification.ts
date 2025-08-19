import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { getQueryKeyForNotifications } from "../../keys/notification";

type PageParam = {
  first_notification_id?: string;
  last_notification_id?: string;
};

async function fetchNotifications(limit: number, pageParam: PageParam) {
  const params: {
    limit: number;
    first_notification_id?: string;
    last_notification_id?: string;
  } = { limit };

  if (pageParam?.first_notification_id && pageParam.last_notification_id) {
    // params.first_notification_id = pageParam.first_notification_id
    params.last_notification_id = pageParam.last_notification_id;
  }
  return await axiosInstance
    .get(API_PATHS.NOTIFICATIONS, {
      params,
    })
    .then((res) => {
      const resData = res.data.data;
      return {
        notifications: resData.notifications,
        end: !!resData.end_of_notifications,
      };
    })
    .catch((e) => {
      throw new Error("Somethig went wrong with notifications api.");
    });
}

type NotificationsPage = {
  notifications: { notification_id: string }[];
  end: boolean;
};

export function useGetNotifications(limit: number) {
  return useInfiniteQuery({
    initialPageParam: undefined,
    queryKey: getQueryKeyForNotifications(),
    queryFn: async ({ pageParam }: { pageParam?: PageParam }) => {
      return await fetchNotifications(limit, pageParam ?? {});
    },
    getNextPageParam: (lastPage: NotificationsPage) => {
      if (lastPage.end) {
        return undefined;
      }
      return {
        first_notification_id: lastPage?.notifications[0]?.notification_id,
        last_notification_id:
          lastPage?.notifications[lastPage?.notifications?.length - 1]
            ?.notification_id,
      };
    },
  });
}
/**
 * Marks all notifications as read or unread.
 * In case of error it returns null.
 * @param readAll
 * @returns
 */
export async function readNotifications(readAll: boolean) {
  return await axiosInstance
    .put(API_PATHS.NOTIFICATION_READ, {
      read_all: readAll,
    })
    .then((res) => {
      return res.data.data;
    })
    .catch((e) => {
      return undefined;
    });
}

export function useReadNotifications({
  onSuccess,
  onError,
}: {
  onSuccess?: (props: Awaited<ReturnType<typeof readNotifications>>) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: (readAll: boolean) => readNotifications(readAll),
    onSuccess,
    onError,
  });
}
