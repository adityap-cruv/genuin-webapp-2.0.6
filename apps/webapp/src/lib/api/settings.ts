import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './instance'
import { useGenuinOptions } from '../stores/genuin-options'
import { validateProfileDetails } from '../schemas/profile/profile'
import { NOT_FOUND_ERROR_CODES } from '../constants'

type FeedbackType = {
  email?: string | null
  message?: string | null
  type?: string
}

export async function fetchUserData(nickname: string, forBrand?: boolean) {
  const payload = forBrand ? { brand_slug: nickname } : { nickname }

  return await axiosInstance
    .post('/goservices/profile/info', payload)
    .then((res) => {
      return validateProfileDetails(res.data.data)
    })
    .catch((e) => {
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.user || e.response.data.code === NOT_FOUND_ERROR_CODES.brand) {
        throw new Error(e.response.data.code)
      }
      throw new Error('Something went wrong in profile details api.')
    })
}

export function getUserData(nickname: string) {
  //  There are no chances that this nickname will be null as we only allow user to visit this page if they are logged in.
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
