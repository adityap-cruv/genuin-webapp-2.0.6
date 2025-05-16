import { LOGIN_SOURCE } from '@/const'
import { getBaseHeaders } from '@/headers'
import { AuthUser } from '@/type'
import { encryptText, getApiUrl, getEncryptedDeviceId } from '@/utils'

type SendOtpProps = {
  phoneNumber: string
  email: string
}
export type AuthActionType =
  | 'JOIN_COMMUNITY'
  | 'SUBSCRIBE'
  | 'KS_CB_REQUEST'
  | 'DELETE_ACCOUNT'

let preAuthSessionId: string | null = null
let resDeviceId: string | null = null

function parseUserData(
  data: any,
  accessToken: string,
  refreshToken: string,
): AuthUser {
  return {
    isAvatar: data.is_avatar,
    id: data.user_id,
    phoneNumber: data.phone,
    nickname: data.nickname,
    image: data.profile_image,
    email: data.email,
    bio: data.bio,
    name: data.name,
    accessToken,
    ksCbRequestStatus: data.ks_cb_request_status,
    isBrandSystemUser: data.is_brand_system_user,
    brandId: data.brand_id,
    brandSlug: data?.brand?.brand_slug ? data?.brand?.brand_slug : null,
    hasTopics: data.onboarding_topics,
    brandGuidelines: data.brand_guidelines,
    refreshToken,
    birth: data.birthday,
    usernameSet: !data.is_username_generated,
  }
}

export async function sendOtp({
  email,
  phoneNumber,
  isUpdate,
}: Partial<SendOtpProps> & { isUpdate?: boolean }) {
  try {
    const response = await fetch(getApiUrl('/api/v4/auth/signinup/code'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        phoneNumber: phoneNumber ? encryptText(phoneNumber, false) : undefined,
        email: email ? encryptText(email, false) : undefined,
        encrypted_device_id: getEncryptedDeviceId(),
        is_update_flow: isUpdate,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json()
      throw { data: { ...errorBody, status: response.status } }
    }

    const resData = (await response.json()).data
    // To send in consume OTP
    preAuthSessionId = resData.preAuthSessionId
    resDeviceId = resData.deviceId

    return {
      codeSent: true,
      retryTime: resData.retryTime,
      message: resData.message,
      responseCode: response.status,
    }
  } catch (e: any) {
    let message = 'Something went wrong. Please try again!'
    const retryTime = Number(e?.data?.retryTime)

    if (e?.data?.code === '5262') {
      message =
        'This number is linked to another account. Please use a different one.'
    } else if (e?.data?.code === '5205') {
      message = 'Email already exists. Please try another one.'
    } else if (e?.data?.code === '5263') {
      message = isUpdate
        ? 'Unable to send the code. Please use another phone number.'
        : 'Unable to send the code. Please use another phone number or email to log in.'
    } else if (!isNaN(retryTime)) {
      if (retryTime < 1) {
        const minutes = Math.floor(retryTime / 60)
        const leftSeconds = retryTime % 60

        message =
          minutes >= 1
            ? `Please try again after ${
                minutes < 10 ? `0${minutes}` : minutes
              }:${leftSeconds < 10 ? `0${leftSeconds}` : leftSeconds} minutes!`
            : `Please try again after 00:${
                retryTime < 10 ? `0${retryTime}` : retryTime
              }!`
      }
    }

    return {
      codeSent: false,
      retryTime,
      message,
      responseCode: e?.data?.status,
    }
  }
}

/**
 * This API is only for login/signup flow.
 * @returns
 */
export async function consumeOtp({
  email,
  phoneNumber,
  code,
}: Partial<SendOtpProps> & { code: string }) {
  try {
    console.log('preAuthSessionId', getBaseHeaders(true))
    const response = await fetch(
      getApiUrl('/api/v4/auth/signinup/code/consume'),
      {
        method: 'POST',
        headers: {
          ...getBaseHeaders(true),
        },
        body: JSON.stringify({
          userInputCode: code,
          phoneNumber: phoneNumber
            ? encryptText(phoneNumber, false)
            : undefined,
          email: email ? encryptText(email, false) : undefined,
          login_source: LOGIN_SOURCE.web,
          // login source is web according to backend.
          device_type: 3,
          encrypted_device_id: getEncryptedDeviceId(),
          preAuthSessionId,
          deviceId: resDeviceId,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('OTP verification failed')
    }

    const accessToken = response.headers.get('gn-access-token')
    const refreshToken = response.headers.get('gn-refresh-token')
    const resData = (await response.json()).data

    let user = null
    if (resData && accessToken && refreshToken) {
      user = parseUserData(resData, accessToken, refreshToken)
    }

    return { otpVerified: true, user }
  } catch (e) {
    return { otpVerified: false, user: null }
  }
}

/**
 * This API is only for update email/phone flow.
 * @returns
 */
export async function updateEmailOrPhone(code: string) {
  try {
    const response = await fetch(getApiUrl('/api/v4/update_email_phone'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        userInputCode: code,
        deviceId: resDeviceId,
        encrypted_device_id: getEncryptedDeviceId(),
        preAuthSessionId,
      }),
    })

    if (!response.ok) {
      throw new Error('Verification failed')
    }

    return { verified: true }
  } catch (_) {
    return { verified: false }
  }
}

export async function acceptBrandGuidelines() {
  try {
    const response = await fetch(getApiUrl('/api/v4/accept_brand_guidelines'), {
      method: 'POST',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Failed to accept brand guidelines')
    }

    return true
  } catch (e) {
    return false
  }
}

export async function uploadProfileImage(file: File) {
  try {
    // Step 1: Get the upload URL
    const getUrlResponse = await fetch(
      getApiUrl('/api/v3/users/video/upload/create_upload_url'),
      {
        method: 'POST',
        headers: getBaseHeaders(true),
        body: JSON.stringify({
          contentType: file.type,
          path: `uploads/profile_images/${file.name}`,
        }),
      },
    )

    if (!getUrlResponse.ok) {
      throw new Error('Failed to get upload URL')
    }

    const uploadUrl = (await getUrlResponse.json()).data.uploadURL

    // Step 2: Upload the file to the obtained URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    return uploadResponse.status === 200
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('::ERROR IN UPLOAD API::', e)
    return false
  }
}

export async function validateUsername(nickname: string) {
  try {
    const response = await fetch(getApiUrl('/api/v3/users/validate_nickname'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({ nickname }),
    })

    if (!response.ok) {
      throw new Error('Failed to validate username')
    }

    const resData = await response.json()

    if (resData.code === 200) {
      return true
    } else if (resData.code === '5073') {
      return false
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('::ERROR in validate username::', e)
    return false
  }
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

export async function patchUserDetails(
  user: Partial<UserType>,
): Promise<{ status: boolean; user: any }> {
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
      throw new Error('Failed to update user profile')
    }

    const resData = await response.json()

    return { status: response.status === 200, user: resData.data }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('::ERROR in update user profile::', e)
    throw new Error('Something went wrong')
  }
}

export async function deleteUserAccount(): Promise<{
  code: number
  data: any
}> {
  try {
    const response = await fetch(getApiUrl('/api/v3/users/delete'), {
      method: 'DELETE',
      headers: getBaseHeaders(true),
    })

    const resData = await response.json()

    return {
      code: resData.code,
      data: resData.data,
    }
  } catch (e: any) {
    const errorResponse = await e?.response?.json?.()
    return {
      code: Number(errorResponse?.code || 500),
      data: errorResponse?.data || null,
    }
  }
}

export async function getBrandGuidelines({
  brandId,
  idDefault,
}: {
  brandId: string | undefined
  idDefault: boolean
}): Promise<{ code: number; data: any }> {
  try {
    const response = await fetch(
      getApiUrl('/api/v3/brand/guidelines') +
        `?brand_id=${brandId}&is_default=${idDefault}`,
      {
        method: 'GET',
        headers: getBaseHeaders(true),
      },
    )

    const resData = await response.json()

    return {
      code: resData.code,
      data: resData.data,
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('::error in guidelines api::', e?.response?.data?.code)
    return {
      code: Number(e?.response?.data?.code || 500),
      data: e?.response?.data?.data || null,
    }
  }
}

/**
 * Returns the KS CB request status. If there is an error, it will return status 4.
 *
 * The status can be:
 * - 1: Pending to request.
 * - 2: Requested. If the request is rejected or approved, the status will be updated to 3 (if approved) or 1 (if rejected).
 * - 3: Accepted.
 *
 * @returns {Promise<{ status: number }>} The status of the request.
 */
export async function fetchKsCbRequestStatus(): Promise<{ status: number }> {
  try {
    const response = await fetch(getApiUrl(`/api/v3/brand/cb_request_status`), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch KS CB request status')
    }

    const resData = await response.json()
    return { status: resData.data?.cb_request_status }
  } catch (error) {
    console.error('::Error in fetchKsCbRequestStatus::', error)
    return { status: 1 }
  }
}

export async function ksCbRequest(): Promise<{ code: number; data: any }> {
  try {
    const response = await fetch(getApiUrl('/api/v3/users/ks_cb_request'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({ source: 'app_web' }),
    })

    const resData = await response.json()

    return {
      code: resData.code,
      data: resData.data,
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('::error in ks_cb_request api::', e?.response?.data?.code)
    return {
      code: Number(e?.response?.data?.code || 500),
      data: e?.response?.data?.data || null,
    }
  }
}

export async function miniProfile(
  verifiedKsToken: boolean,
): Promise<{ code: number; data: any }> {
  try {
    const response = await fetch(
      getApiUrl('/api/v3/users/mini_profile') +
        `?verified_ks_token=${verifiedKsToken}`,
      {
        method: 'GET',
        headers: getBaseHeaders(true),
      },
    )

    const resData = await response.json()

    return {
      code: resData.code,
      data: resData.data,
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('::error in mini_profile api::', e?.response?.data?.code)
    return {
      code: Number(e?.response?.data?.code || 500),
      data: e?.response?.data?.data || null,
    }
  }
}

export async function saveVisitor(
  visitorId: string,
  browserType: string,
  deviceType: string,
  os: string,
  brandId: string | undefined,
): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/api/v3/guestusers/visit'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        device_id: encryptText(visitorId || '', true),
        brand_id: brandId,
        meta_data: {
          os_type: os,
          device_type: deviceType,
          browser_type: browserType,
        },
      }),
    })

    if (!response.ok) {
      return false
    }

    const resData = await response.json()
    return resData.code === 200
  } catch (e) {
    return false
  }
}

export async function getUserDataForSSO(
  code: string,
  provider: string,
): Promise<{ user: ReturnType<typeof parseUserData> | undefined }> {
  try {
    const response = await fetch(getApiUrl('/api/v4/auth/signinup'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        encrypted_device_id: getEncryptedDeviceId(),
        login_source: LOGIN_SOURCE.web,
        device_type: 3,
        thirdPartyId: provider,
        redirectURIInfo: {
          redirectURIOnProviderDashboard: `${process.env.NEXT_PUBLIC_REDIRECT_URI}`,
          redirectURIQueryParams: {
            code,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Something went wrong, please try again later')
    }

    const resData = await response.json()
    const accessToken = response.headers.get('gn-access-token')
    const refreshToken = response.headers.get('gn-refresh-token')
    const data = resData.data

    const user =
      data && accessToken && refreshToken
        ? parseUserData(data, accessToken, refreshToken)
        : undefined

    return { user }
  } catch (e) {
    throw new Error('Something went wrong, please try again later')
  }
}

export async function ssoAutoLogin(
  token: string,
  brandId: string,
): Promise<ReturnType<typeof parseUserData> | null> {
  try {
    const response = await fetch(getApiUrl('/api/v4/sso/autologin'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        encrypted_device_id: getEncryptedDeviceId(),
        token,
        brand_id: brandId,
        device_type: 3,
        login_source: LOGIN_SOURCE.web_sdk,
      }),
    })

    if (!response.ok) {
      return null
    }

    const resData = await response.json()
    const accessToken = response.headers.get('gn-access-token')
    const refreshToken = response.headers.get('gn-refresh-token')

    if (resData.code === 200 && accessToken && refreshToken) {
      return parseUserData(resData.data, accessToken, refreshToken)
    }

    return null
  } catch (e) {
    return null
  }
}
