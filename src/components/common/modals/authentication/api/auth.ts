import { axiosInstance } from '@/lib/api/instance'
import { LOGIN_SOURCE } from '@/lib/constants'
import { useLocalStorage } from '@/lib/stores/local-storage'
import { encryptText } from '@/lib/utils'
import axios from 'axios'

type SendOtpProps = {
  phoneNumber: string
  email: string
}
export type AuthActionType = 'JOIN_COMMUNITY' | 'SUBSCRIBE' | 'KS_CB_REQUEST' | 'DELETE_ACCOUNT'

let preAuthSessionId: string | null = null
let resDeviceId: string | null = null

function parseUserData(data: any, accessToken: string, refreshToken: string) {
  return {
    isAvatar: data.is_avatar,
    userId: data.user_id,
    phoneNumber: data.phone,
    nickname: data.nickname,
    profileImage: data.profile_image,
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

export async function sendOtp({ email, phoneNumber, isUpdate }: Partial<SendOtpProps> & { isUpdate?: boolean }) {
  const deviceId = useLocalStorage.getState().deviceId
  return await axiosInstance
    .post('/api/v4/auth/signinup/code', {
      phoneNumber: phoneNumber ? encryptText(phoneNumber, false) : undefined,
      email: email ? encryptText(email, false) : undefined,
      encrypted_device_id: encryptText(deviceId, true),
      is_update_flow: isUpdate,
    })
    .then((res) => {
      // To send in consume otp.
      preAuthSessionId = res.data.data.preAuthSessionId
      // To send in consume otp
      resDeviceId = res.data.data.deviceId
      return { codeSent: true, retryTime: res.data.data.retryTime, message: undefined }
      // return true
    })
    .catch((e) => {
      let message = 'Something went wrong. Please try again!'
      const retryTime = Number(e.response.data.data?.retryTime)
      if (e.response.data.code === '5263') {
        message = isUpdate
          ? 'Unable to send the code. Please use another phone number.'
          : 'Unable to send the code. Please use another phone number or email to log in.'
      } else if (!isNaN(retryTime)) {
        if (retryTime < 1) {
          const minutes = Math.floor(retryTime / 60)
          if (minutes >= 1) {
            const leftSeconds = retryTime % 60
            message = `Please try again after ${minutes < 10 ? `0${minutes}` : minutes}:${
              leftSeconds < 10 ? `0${leftSeconds}` : leftSeconds
            } minutes!`
          } else {
            message = `Please try again after 00:${retryTime < 10 ? `0${retryTime}` : retryTime}!`
          }
        }
      }

      return {
        codeSent: false,
        retryTime,
        message,
      }
    })
}

/**
 * This api is only for login/signup flow.
 * @returns
 */
export async function consumeOtp({ email, phoneNumber, code }: Partial<SendOtpProps> & { code: string }) {
  const deviceId = useLocalStorage.getState().deviceId
  return await axiosInstance
    .post('/api/v4/auth/signinup/code/consume', {
      userInputCode: code,
      phoneNumber: phoneNumber ? encryptText(phoneNumber, false) : undefined,
      email: email ? encryptText(email, false) : undefined,
      login_source: LOGIN_SOURCE.web,
      // login source is web according to backend.
      device_type: 3,
      encrypted_device_id: encryptText(deviceId, true),
      preAuthSessionId,
      deviceId: resDeviceId,
    })
    .then((res) => {
      const accessToken = res.headers['gn-access-token']
      const refreshToken = res.headers['gn-refresh-token']
      const data = res.data.data
      let user
      if (data) {
        user = parseUserData(data, accessToken, refreshToken)
      }
      return { otpVerified: true, user }
    })
    .catch((e) => {
      // console.log('e::', e)
      return { otpVerified: false, user: null }
    })
}

/**
 * This apis is only for update email/phone flow.
 * @returns
 */
export async function updateEmailOrPhone(code: string) {
  return await axiosInstance
    .post('/api/v4/update_email_phone', {
      userInputCode: code,
      deviceId: resDeviceId,
      encrypted_device_id: encryptText(useLocalStorage.getState().deviceId, true),
      preAuthSessionId,
    })
    .then((res) => {
      return { verified: true }
    })
    .catch((_) => {
      return { verified: false }
    })
}

export async function acceptBrandGuidelines() {
  return await axiosInstance
    .post('/api/v4/accept_brand_guidelines')
    .then((res) => {
      return true
    })
    .catch((e) => {
      return false
    })
}

export async function uploadProfileImage(file: File) {
  try {
    const getUrlResponse = await axiosInstance.post('/api/v3/users/video/upload/create_upload_url', {
      contentType: file.type,
      path: `uploads/profile_images/${file.name}`,
    })
    const uploadUrl = getUrlResponse.data.data.uploadURL
    const uploadResponse = await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    })
    return uploadResponse.status === 200
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('::ERROR IN UPLOAD API::', e)
    return false
  }
}

export async function validateUsername(nickname: string) {
  return await axiosInstance
    .post('/api/v3/users/validate_nickname', { nickname })
    .then((res) => {
      if (res.data.code === 200) return true
      else if (res.data.code === '5073') return false
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::ERROR in validata username::', e)
      return false
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

export async function updateUser(user: Partial<UserType>): Promise<{ status: boolean; user: any }> {
  return await axiosInstance
    .patch('/api/v3/users/update_user_profile', { user })
    .then((res) => {
      return { status: res.status === 200, user: res.data.data }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::ERROR in updata user profile::', e)
      throw new Error('Something went wrong')
    })
}

export async function deleteUserAccount(): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .delete('/api/v3/users/delete')
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}

export async function getBrandGuidelines({
  brandId,
  idDefault,
}: {
  brandId: string | undefined
  idDefault: boolean
}): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .get('/api/v3/brand/guidelines', {
      params: {
        brand_id: brandId,
        is_default: idDefault,
      },
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::error in guidelines api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: e.response.data.data }
    })
}

export async function ksCbRequest(): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post('/api/v3/users/ks_cb_request', {
      source: 'app_web',
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::error in ks_cb_request api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: e.response.data.data }
    })
}

export async function miniProfile(verifiedKsToken: boolean): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .get('/api/v3/users/mini_profile', {
      params: {
        verified_ks_token: verifiedKsToken,
      },
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::error in mini_profile api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: e.response.data.data }
    })
}

export async function saveVisitor(
  visitorId: string,
  browserType: string,
  deviceType: string,
  os: string,
  brandId: string | undefined
) {
  await axiosInstance
    .post('/api/v3/guestusers/visit', {
      device_id: encryptText(visitorId || '', true),
      brand_id: brandId,
      meta_data: {
        os_type: os,
        device_type: deviceType,
        browser_type: browserType,
      },
    })
    .then((res) => {
      return true
      // if (res.data.code === 200) return true
      // else if (res.data.code === '5073') return false
    })
    .catch((e) => {
      return false
    })
}

export async function getUserDataForSSO(
  code: string,
  provider: string
): Promise<{ user: ReturnType<typeof parseUserData> | undefined }> {
  const deviceId = useLocalStorage.getState().deviceId
  return await axiosInstance
    .post('/api/v4/auth/signinup', {
      encrypted_device_id: encryptText(deviceId, true),
      login_source: LOGIN_SOURCE.web,
      // login source is web according to backend.
      device_type: 3,
      thirdPartyId: provider,
      redirectURIInfo: {
        redirectURIOnProviderDashboard: `${process.env.NEXT_PUBLIC_REDIRECT_URI}`,
        redirectURIQueryParams: {
          code,
        },
      },
    })
    .then((res) => {
      const accessToken = res.headers['gn-access-token']
      const refreshToken = res.headers['gn-refresh-token']
      const data = res.data.data
      const user = data ? parseUserData(data, accessToken, refreshToken) : undefined
      return { user }
    })
    .catch((e) => {
      throw new Error('Something went wrong, please try again later')
    })
}

export async function getUrlToRedirectForSSO(thirdPartyId: string) {
  return await axiosInstance
    .get('/api/v4/auth/authorisationurl', {
      params: {
        thirdPartyId,
        redirectURIOnProviderDashboard: `${process.env.NEXT_PUBLIC_REDIRECT_URI}`,
      },
    })
    .then((res) => {
      return res.data.data.url
    })
    .catch((e) => {
      throw new Error('Something went wrong, please try again later')
    })
}
