import { axiosInstance } from '@/lib/api/instance'
import { LOGIN_SOURCE } from '@/lib/constants'
import { useLocalStorage } from '@/lib/stores/local-storage'
import { encryptText } from '@/lib/utils'
import axios from 'axios'

type SendOtpProps = {
  phoneNumber: string
  email: string
}

let preAuthSessionId: string | null = null
let resDeviceId: string | null = null

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
      console.log('res.data.data::', res.data)
      return { codeSent: true, retryTime: res.data.data.retryTime, message: null }
      // return true
    })
    .catch((e) => {
      console.log('e::', e)
      return {
        codeSent: false,
        retryTime: e.response.data.data.retryTime,
        message: e.response.data.message,
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
      const user = {
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
        brandSlug: data.brand_slug ? data.brand_slug : null,
        onboardingTopics: data.onboarding_topics,
        brandGuidelines: data.brand_guidelines,
        refreshToken,
        birth: data.birthday,
      }

      return { otpVerified: true, user }
    })
    .catch((e) => {
      console.log('e::', e)
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
      console.log('res::', res)
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
