import { axiosInstance } from './instance'

type FeedbackType = {
  email?: string | null
  message?: string | null
  type?: string
}

export async function Feedback(payload: Partial<FeedbackType>): Promise<{ status: boolean; data: any }> {
  return await axiosInstance
    .post('/api/v3/contact-us', payload)
    .then((res) => {
      return { status: res.status === 200, data: res.data.data }
    })
    .catch((e) => {
      throw new Error()
    })
}

export async function Settings(): Promise<{ status: boolean; data: any }> {
  return await axiosInstance
    .get('/api/v3/users/settings')
    .then((res) => {
      return { status: res.status === 200, data: res.data.data }
    })
    .catch((e) => {
      throw new Error()
    })
}

// TODO: update naming convention here.
type NotificationType = {
  conversation_alarm_notification?: boolean | null
  message_notification?: boolean | null
  roundtable_notification?: boolean
}

export async function NotificationsSettings(
  payload: Partial<NotificationType>
): Promise<{ status: boolean; data: any }> {
  return await axiosInstance
    .patch('/api/v3/users/update_notification_settings', payload)
    .then((res) => {
      return { status: res.status === 200, data: res.data.data }
    })
    .catch((e) => {
      throw new Error()
    })
}
