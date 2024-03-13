import { encryptText } from '@lib/utils'
import { axiosInstance, setAuthTokenInAxiosInstance } from './instance'

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
}: SignupProps): Promise<{ code: number; data: any }> {
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
      setAuthTokenInAxiosInstance(res.headers['x-auth-token'])
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in signup api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: undefined }
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
}> {
  return await axiosInstance
    .get('/api/v3/verify_email_token', {
      params: {
        token,
      },
      baseURL: process.env.NEXT_PUBLIC_INTERNAL_API_URL,
    })
    .then((res) => {
      const data = res?.data?.data
      return {
        code: Number(res.data.code),
        actionMetadata: data?.action_metadata as ActionMetadataType,
        user: data?.user,
        emailType: data?.email_type,
      }
    })
    .catch((e) => {
      console.log('error::', e)
      const data = e?.response?.data
      return { code: Number(data.code), emailType: data.email_type, actionMetadata: data.action_meta_data }
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
