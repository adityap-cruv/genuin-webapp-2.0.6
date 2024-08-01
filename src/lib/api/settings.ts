import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './instance'
import { fetchUserData } from './profile'
import { useGenuinOptions } from '../stores/genuin-options'

type FeedbackType = {
  email?: string | null
  message?: string | null
  type?: string
}

export function getUserData() {
  //  There are no chances that this nickname will be null as we only allow user to visit this page if they are logged in.
  const nickname = useGenuinOptions.getState().user?.nickname
  return useQuery({ queryKey: ['user', 'data', nickname], queryFn: async () => await fetchUserData(nickname ?? '') })
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
