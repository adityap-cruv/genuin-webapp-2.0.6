import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { ProfileDetailsType, validateProfileDetails } from './schema'
import { useQuery } from '@tanstack/react-query'
import {
  getQueryKeyForUserDetails,
  getQueryKeyForUserSettings,
} from '@/utils/constants/keys'
import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'
import { User } from '@/type'

/**
 * Fetches user profile details by nickname.
 *
 * @param {string} nickname - The user's nickname.
 * @returns {Promise<ProfileDetailsType>} The validated profile details.
 * @throws {Error} If the user is not found or an API error occurs.
 */
export async function fetchUserData(
  nickname: string,
): Promise<ProfileDetailsType> {
  try {
    const response = await fetch(getApiUrl('/goservices/profile/info'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({ nickname }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (errorData.code === NOT_FOUND_ERROR_CODES.user) {
        throw new Error(errorData.code)
      }
      throw new Error('Something went wrong in profile details API.')
    }

    const resData = await response.json()
    return validateProfileDetails(resData.data)
  } catch (error) {
    console.error('::Error in fetchUserData::', error)
    throw error
  }
}

export function getUserDetails(nickname: string) {
  return useQuery({
    queryFn: () => fetchUserData(nickname),
    queryKey: getQueryKeyForUserDetails(nickname),
  })
}

type UserType = {
  name?: string | null
  bio?: string | null
  nickname: string
  is_avatar: boolean
  profile_image: string
  birthday: string
  linkedin_id?: string | null
  insta_id?: string | null
  twitter_id?: string | null
  tiktok_id?: string | null
  platform_guidelines: boolean
  community_walkthrough: boolean
  password: string
}

/**
 * Updates the user profile with provided data.
 *
 * @param {Partial<UserType>} user - The user data to update.
 * @returns {Promise<User | null>} The updated user data(null in case of error).
 * @throws {Error} If the update request fails.
 */
export async function updateUser(
  user: Partial<UserType>,
): Promise<User | null> {
  try {
    const response = await fetch(
      getApiUrl('/api/v3/users/update_user_profile'),
      {
        method: 'PATCH',
        headers: getBaseHeaders(true),
        body: JSON.stringify({ user }),
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong')
    }

    const resData = await response.json()
    return resData.data
  } catch (error) {
    console.error('::ERROR in updateUser profile::', error)
    throw Error('Something went wrong while updating user details.')
  }
}

type FeedbackType = {
  email?: string | null
  message?: string | null
  type?: string
}

/**
 * Submits user feedback.
 *
 * @param {Partial<FeedbackType>} payload - The feedback data to send.
 * @returns {Promise<{ status: boolean; data: any }>} - The response status and data.
 * @throws {Error} If the request fails.
 */
export async function postFeedback(
  payload: Partial<FeedbackType>,
): Promise<{ status: boolean; data: any }> {
  try {
    const response = await fetch(getApiUrl('/api/v3/contact-us'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to submit feedback')
    }

    const resData = await response.json()
    return { status: response.status === 200, data: resData.data }
  } catch (error) {
    console.error('Error in Feedback API:', error)
    throw error
  }
}

export type NotificationType = {
  conversation_alarm_notification?: boolean | null
  message_notification?: boolean | null
  roundtable_notification?: boolean
}

/**
 * Updates user notification settings.
 * @param {Partial<NotificationType>} payload - The notification settings to update.
 * @returns {Promise<boolean>} - The response status.
 */
export async function updateNotificationSettings(
  payload: Partial<NotificationType>,
): Promise<boolean> {
  try {
    const response = await fetch(
      getApiUrl('/api/v3/users/update_notification_settings'),
      {
        method: 'PATCH',
        headers: getBaseHeaders(true),
        body: JSON.stringify(payload),
      },
    )

    return response.ok
  } catch (error) {
    console.error('Error in NotificationsSettings API:', error)
    return false
  }
}

/**
 * Currently only necessary fields are typed here.
 */
type SettingsType = {
  messageNotification: boolean
  conversationAlarmNotification: boolean
  roundtable_notification: boolean
}

/**
 * Fetches user settings.
 * @returns {Promise<SettingsType>} - The response status and user settings data.
 * @throws {Error} If the request fails.
 */
export async function fetchUserSettings(): Promise<SettingsType> {
  try {
    const response = await fetch(getApiUrl('/api/v3/users/settings'), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user settings')
    }

    const resData = await response.json()
    return resData.data as SettingsType
  } catch (error) {
    console.error('Error fetching user settings:', error)
    throw error
  }
}

export function getUserSettings() {
  return useQuery({
    queryFn: fetchUserSettings,
    queryKey: getQueryKeyForUserSettings(),
  })
}
