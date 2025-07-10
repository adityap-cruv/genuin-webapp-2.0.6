import { axiosInstance } from './instance'

/**
 * Fetch a single page of notifications (no react-query, just a fetcher).
 * @param limit Number of notifications to fetch
 * @param pageParam Pagination params: { first_notification_id?: string; last_notification_id?: string }
 * @returns { notifications: any[], end: boolean }
 */
export async function fetchNotifications(
  limit: number,
  pageParam: { first_notification_id?: string; last_notification_id?: string } = {}
) {
  const params: { limit: number; first_notification_id?: string; last_notification_id?: string } = { limit }

  if (pageParam.first_notification_id) {
    params.first_notification_id = pageParam.first_notification_id
  }
  if (pageParam.last_notification_id) {
    params.last_notification_id = pageParam.last_notification_id
  }

  try {
    const res = await axiosInstance.get('/api/v3/notifications', { params })
    const resData = res.data.data
    return {
      notifications: resData.notifications,
      end: !!resData.end_of_notifications,
    }
  } catch (e) {
    throw new Error('Something went wrong with notifications api.')
  }
}

// export function getNotifications(limit: number) {
//   return useInfiniteQuery({
//     queryFn: async ({ pageParam }) => await fetchNotifications(limit, pageParam),
//     queryKey: ['notification', 'paginated'],
//     getNextPageParam: (lastPage, pages) => {
//       if (lastPage.end) {
//         return
//       }
//       return {
//         first_notification_id: lastPage.notifications[0].notification_id,
//         last_notification_id: lastPage.notifications[lastPage.notifications.length - 1].notification_id,
//       }
//     },
//     initialPageParam: {},
//   })
// }

/**
 * Marks all notifications as read or unread.
 * In case of error it returns null.
 * @param readAll
 * @returns
 */
export async function readNotifications(readAll: boolean) {
  return await axiosInstance
    .put('/api/v3/notification_read', {
      read_all: readAll,
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      return undefined
    })
}

/**
 * Fetches the notification count. In case of error it returns null.
 * @returns null or { status: boolean, count: number }
 */
export async function notificationsCount() {
  return await axiosInstance
    .get('/api/v3/notification_count')
    .then((res) => {
      return { status: res.status === 200, count: res?.data?.data?.count }
    })
    .catch((e) => {
      return undefined
    })
}
