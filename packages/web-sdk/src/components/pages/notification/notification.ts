import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'
import { useInfiniteQuery } from '@tanstack/react-query'

async function fetchNotifications(
  limit: number,
  pageParam?: { first_notification_id?: string; last_notification_id?: string },
) {
  try {
    const url = new URL(getApiUrl('/api/v3/notifications'))
    url.searchParams.append('limit', limit.toString())

    if (pageParam?.last_notification_id) {
      url.searchParams.append(
        'last_notification_id',
        pageParam.last_notification_id,
      )
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { ...getBaseHeaders(true) },
    })

    if (!response.ok) {
      throw new Error('Something went wrong with the notifications API.')
    }

    const resData = await response.json()
    return {
      notifications: resData.data.notifications,
      end: !!resData.data.end_of_notifications,
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

export function getNotifications(limit: number) {
  return useInfiniteQuery({
    queryFn: async ({
      pageParam,
    }: {
      pageParam?: {
        first_notification_id?: string
        last_notification_id?: string
      }
    }) => await fetchNotifications(limit, pageParam),
    queryKey: ['notification', 'paginated'],
    getNextPageParam: (lastPage: {
      notifications: { notification_id: string }[]
      end: boolean
    }) => {
      if (lastPage.end) {
        return undefined
      }
      return {
        first_notification_id: lastPage.notifications[0].notification_id,
        last_notification_id:
          lastPage.notifications[lastPage.notifications.length - 1]
            .notification_id,
      }
    },
    initialPageParam: undefined,
  })
}

export async function readNotifications(readAll: boolean) {
  try {
    const response = await fetch(getApiUrl('/api/v3/notification_read'), {
      method: 'PUT',
      headers: { ...getBaseHeaders(true) },
      body: JSON.stringify({ read_all: readAll }),
    })

    if (!response.ok) {
      throw new Error('Failed to mark notifications as read.')
    }

    const resData = await response.json()
    return resData.data
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return undefined
  }
}

export async function notificationsCount() {
  try {
    const response = await fetch(getApiUrl('/api/v3/notification_count'), {
      method: 'GET',
      headers: { ...getBaseHeaders(true) },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch notification count.')
    }

    const resData = await response.json()
    return { status: response.status === 200, count: resData?.data?.count }
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return undefined
  }
}
