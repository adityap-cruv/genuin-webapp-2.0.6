import { encryptText } from '@lib/utils'
import { axiosInstance, setAuthTokenInAxiosInstance } from './instance'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useGenuinOptions } from '@lib/stores/genuin-options'

type RecaptchaActionType = 'LOGIN' | 'SIGNUP'

export type AuthActionType = 'JOIN_COMMUNITY'

type ActionMetadataType = {
  action?: AuthActionType
  path: string
}

type SignupProps = {
  name?: string
  email: string
  isAvatar?: boolean
  profileImage: string | File
  deviceId?: string
  recaptchaToken: string
  signupSource: number
  recaptchaAction: RecaptchaActionType
  actionMetadata: ActionMetadataType
}

type loginViaPhoneProps = {
  phone: string | undefined
  platform?: string
  token: string
  verificationType: number
  brandId?: number
  loginSource: any
}

type OtpProps = {
  userId: string
  otp: number
  token: string
  loginSource: number
  brandId?: number
}

export async function signup({
  deviceId,
  email,
  isAvatar,
  name,
  profileImage,
  recaptchaAction,
  recaptchaToken,
  signupSource,
  actionMetadata,
}: SignupProps): Promise<{ code: number; data: any; accessToken?: string }> {
  return await axiosInstance
    .post(
      '/api/v3/signup',
      {
        name,
        email,
        is_avatar: isAvatar,
        device_id: encryptText(deviceId ?? '', true),
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
        profile_image: profileImage,
        signup_source: signupSource,
        // TODO: remove this statically typed brand_id once testin gets over
        brand_id: 1429,
        action_meta_data: actionMetadata,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    .then((res) => {
      setAuthTokenInAxiosInstance()
      return { code: 200, data: res.data.data, accessToken: res.headers['x-auth-token'] }
    })
    .catch((e) => {
      console.log('::error in signup api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: undefined, accessToken: undefined }
    })
}

export async function verifyEmail(token: string): Promise<{
  code: number
  actionMetadata?: ActionMetadataType
  user?: any
  /**
   * 11 -> magic link
   * 12 -> verify email
   */
  emailType: 11 | 12
  accessToken?: string
  email?: string
}> {
  console.log('::Token to be sent::', token)
  return await axiosInstance
    .get('/api/v3/verify_email_token', {
      params: {
        token,
      },
      baseURL: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
    })
    .then((res) => {
      console.log('total-reseponse:', JSON.stringify(res))
      console.log('Resp-Header', res.headers['x-auth-token'])
      const data = res?.data?.data
      const user = data?.user
      console.log('User::', JSON.stringify(user))
      Object.assign(user, { accessToken: res.headers['x-auth-token'] })
      console.log('user after manipulation::', JSON.stringify(user))
      console.log('response::', JSON.stringify(res.data.data))
      return {
        code: Number(res?.data?.code),
        actionMetadata: data?.action_metadata as ActionMetadataType,
        user,
        emailType: data?.email_type,
      }
    })
    .catch((e) => {
      console.log(':: error in verify email::', JSON.stringify(e), e?.response?.data)
      const data = e?.response?.data
      return {
        code: Number(data?.code),
        emailType: data?.email_type,
        actionMetadata: data?.action_meta_data,
        email: data?.email,
      }
    })
}

type UserType = {
  name?: string | null
  bio?: string | null
  nickname: string
  is_avatar: boolean
  profile_image: string
  birthday: string
  linkedin_id: string
  insta_id: string
  twitter_id: string
  tiktok_id: string
  platform_guidelines: boolean
  community_walkthrough: boolean
  password: string
}

export async function updateUser(user: Partial<UserType>): Promise<boolean> {
  return await axiosInstance
    .patch('/api/v3/users/update_user_profile', { user })
    .then((res) => {
      return res.status === 200
    })
    .catch((e) => {
      console.log('::ERROR in updata user profile::', e)
      throw new Error('Something went wrong')
    })
}

export async function validateUsername(nickname: string) {
  return await axiosInstance
    .post('/api/v3/users/validate_nickname', { nickname })
    .then((res) => {
      if (res.status === 200) return true
      return false
    })
    .catch((e) => {
      console.log('::ERROR in validata username::', e)
      return false
    })
}

export async function resendVerificationMail(email: string, emailType: number, actionMetadata?: ActionMetadataType) {
  return await axiosInstance
    .post('api/v3/resend_email_verification', {
      email,
      email_type: emailType,
      device_id: encryptText(useLocalStorage.getState().deviceId, true),
      brand_id: useGenuinOptions.getState().brandId,
      action_meta_data: actionMetadata,
    })
    .then((res) => {
      return true
    })
    .catch((e) => {
      console.log('::Error in resend api::', e)
      throw new Error('Something went wrong')
    })
}

export async function loginViaPhone({
  phone,
  platform,
  token,
  verificationType,
  brandId,
  loginSource,
}: loginViaPhoneProps): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post(
      '/api/v3/send_otp',
      {
        phone: encryptText(phone ?? '', false),
        platform: 3,
        token: encryptText(token, true),
        verification_type: verificationType,
        // TODO: remove this statically typed brand_id once testin gets over
        brand_id: 1429,
        login_source: loginSource,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      setAuthTokenInAxiosInstance(res.headers['x-auth-token'])
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in sendotp api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: undefined }
    })
}

export async function verifyOtp({
  userId,
  otp,
  token,
  loginSource,
  brandId,
}: OtpProps): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post(
      '/api/v3/verify_otp',
      {
        user_id: userId,
        otp,
        token: encryptText(token, true),
        login_source: loginSource,
        // TODO: remove this statically typed brand_id once testin gets over
        brand_id: 1429,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      setAuthTokenInAxiosInstance(res.headers['x-auth-token'])
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in verifyotp api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: undefined }
    })
}
