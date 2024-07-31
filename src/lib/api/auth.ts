import { encryptText } from '@lib/utils'
import { axiosInstance, setAuthTokenInAxiosInstance } from './instance'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import axios from 'axios'

// type RecaptchaActionType = 'LOGIN' | 'SIGNUP'

export type AuthActionType = 'JOIN_COMMUNITY' | 'SUBSCRIBE' | 'KS_CB_REQUEST'

type ActionMetadataType = {
  action?: AuthActionType
  path: string
}

type SignupProps = {
  // name?: string
  email: string
  // isAvatar?: boolean
  // profileImage: string | File
  // deviceId?: string
  // recaptchaToken: string
  signupSource: number
  // recaptchaAction: RecaptchaActionType
  actionMetadata?: ActionMetadataType
}

export async function signup({
  // deviceId,
  email,
  // isAvatar,
  // name,
  // profileImage,
  // recaptchaAction,
  // recaptchaToken,
  signupSource,
  actionMetadata,
}: SignupProps): Promise<{ code: number; data: any; accessToken?: string }> {
  return await axiosInstance
    .post('/api/v3/signup', {
      // name,
      email: encryptText(email, false),
      // is_avatar: isAvatar,
      device_id: encryptText(useLocalStorage.getState().deviceId ?? '', true),
      // recaptcha_token: recaptchaToken,
      // recaptcha_action: recaptchaAction,
      // profile_image: profileImage,
      signup_source: signupSource,
      brand_id: useGenuinOptions.getState().brandId,
      action_meta_data: actionMetadata,
    })
    .then((res) => {
      setAuthTokenInAxiosInstance(res.headers['x-auth-token'])
      return { code: 200, data: res.data.data, accessToken: res.headers['x-auth-token'] }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::error in signup api::', e.response.data)
      return { code: Number(e.response.data.code), data: undefined, accessToken: undefined }
    })
}

type KsSignupProps = {
  email: string
  // recaptchaToken: string
  // recaptchaAction: string
  actionMetadata: Record<string, unknown>
}

export async function ksSignup({
  email,
  actionMetadata,
}: KsSignupProps): Promise<{ code: number; flow?: 'login' | 'signup'; message?: string; retryTime: number }> {
  return await axiosInstance
    .post('/api/v3/ks_login_signup', {
      email: encryptText(email, false),
      brand_id: useGenuinOptions.getState().brandId,
      device_id: encryptText(useLocalStorage.getState().deviceId, true),
      action_meta_data: actionMetadata,
    })
    .then((res) => {
      const retryTime = res?.data?.data?.retryTime
      return { code: res.status, flow: res?.data?.data.flow, retryTime }
    })
    .catch((e) => {
      const retryTime = e.response?.data?.data?.retryTime
      return { code: Number(e?.response?.data?.code), flow: e?.data?.data.flow, retryTime }
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
  emailType: 11 | 12 | 2 | 19 | 20 | 21 | 22
  accessToken?: string
  email?: string
}> {
  return await axiosInstance
    .get('/api/v3/verify_email_token', { params: { token }, baseURL: process.env.NEXT_PUBLIC_INTERNAL_API_URL })
    .then((res) => {
      const data = res?.data?.data
      // console.log('dta::', data)
      const user = data?.user
      if (user) {
        Object.assign(user, { accessToken: res.headers['x-auth-token'] })
      }
      return {
        code: Number(res?.data?.code),
        actionMetadata: data?.action_meta_data as ActionMetadataType,
        user,
        emailType: data?.email_type,
        email: user?.email,
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('ERROR in Email Verify: ', e)
      const data = e?.response?.data
      return {
        code: Number(data?.code),
        emailType: data?.data?.email_type,
        actionMetadata: data?.data?.action_meta_data,
        email: data?.data?.email,
      }
    })
}

export async function verifySMS(token: string): Promise<{
  code: number
  userId?: string
  brandId?: string
  /**
   * 8 -> community sms
   * 9 -> loop sms
   */
  smsType: 8 | 9
  accessToken?: string | null
}> {
  return await axios
    .get(process.env.NEXT_PUBLIC_INTERNAL_API_URL + '/api/v3/verify_sms_token', {
      params: {
        token,
      },
    })
    .then((res) => {
      const data = res?.data?.data
      return {
        code: Number(res?.data?.code),
        userId: data?.user_id,
        brandId: data?.brand_id,
        smsType: data?.sms_type,
        accessToken: res.headers['x-auth-token'],
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('ERROR in sms Verify: ', e)
      const data = e?.response?.data
      return {
        code: Number(data?.code),
        userId: data?.user_id,
        brandId: data?.brand_id,
        smsType: data?.sms_type,
        accessToken: null,
      }
    })
}

/**
 *
 * @param email
 * @param emailType  11 -> magic link, 12 -> verify email
 * @param actionMetadata
 * @returns
 */
export async function resendVerificationMail(
  email: string,
  emailType: number,
  actionMetadata?: ActionMetadataType
): Promise<{ code: number; retryTime: number; data: any }> {
  return await axiosInstance
    .post('api/v3/resend_email_verification', {
      email: encryptText(email, false),
      email_type: emailType,
      device_id: encryptText(useLocalStorage.getState().deviceId, true),
      brand_id: useGenuinOptions.getState().brandId,
      action_meta_data: actionMetadata,
    })
    .then((res) => {
      const retryTime = res?.data?.data?.retryTime || 0
      return { code: res.status, retryTime, data: res?.data?.data }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::Error in resend api::', e)
      const retryTime = e.response?.data?.data?.retryTime || 0
      return { code: Number(e.response.data.code), retryTime, data: e.response?.data?.data }
    })
}

// type LoginViaPhoneType = {
//   phone: string | undefined
//   platform?: string
//   token: string
//   verificationType: number
//   brandId?: number
//   loginSource: any
// }

// export async function loginViaPhone({
//   phone,
//   platform,
//   token,
//   verificationType,
//   brandId,
//   loginSource,
// }: LoginViaPhoneType): Promise<{ code: number; data: any }> {
//   return await axiosInstance
//     .post(
//       '/api/v3/send_otp',
//       {
//         phone: encryptText(phone ?? '', false),
//         platform: 3,
//         token: encryptText(token, true),
//         verification_type: verificationType,
//         brand_id: useGenuinOptions.getState().brandId,
//         login_source: loginSource,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     )
//     .then((res) => {
//       setTempAuthTokenInAxiosInstance(res.headers['x-temp-auth-token'])
//       return { code: 200, data: res.data.data }
//     })
//     .catch((e) => {
//       // eslint-disable-next-line no-console
//       console.log('::error in send otp api::', e.response.data.code)
//       return { code: Number(e.response.data.code), data: undefined }
//     })
// }

type OtpProps = {
  userId: string
  otp: number
  token: string
  loginSource: number
  brandId?: number
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
        brand_id: useGenuinOptions.getState().brandId,
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
      // eslint-disable-next-line no-console
      console.log('::error in verifyotp api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: undefined }
    })
}

type LoginViaEmailType = {
  email: string | undefined
  deviceId: string
  brandId?: string
  password?: string
  loginSource: any
  actionMetaData: ActionMetadataType
}

export async function loginViaEmail({
  email,
  deviceId,
  brandId,
  password,
  loginSource,
  actionMetaData,
}: LoginViaEmailType): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post('/api/v3/login_via_email', {
      email: encryptText(email ?? '', false),
      device_id: encryptText(deviceId, true),
      brand_id: useGenuinOptions.getState().brandId,
      password: encryptText(password ?? '', false),
      login_source: loginSource,
      action_meta_data: actionMetaData,
    })
    .then((res) => {
      const authToken = res.headers['x-auth-token']
      setAuthTokenInAxiosInstance(authToken)
      Object.assign(res.data.data, { accessToken: authToken })
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::error in send otp api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: e.response.data.data }
    })
}

export async function ksCbRequest(accessToken?: string): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post(
      '/api/v3/users/ks_cb_request',
      {
        source: 'app_web',
      },
      {
        headers: { 'x-auth-token': accessToken },
      }
    )
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

export async function addEmailForKs({
  email,
  token,
}: {
  email: string | undefined
  token: string | undefined
}): Promise<{ code: number; data: any; accessToken: string | null }> {
  return await axios
    .post(
      process.env.NEXT_PUBLIC_API_URL + '/api/v3/users/add_email_for_ks',
      {
        email: encryptText(email ?? '', false),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      }
    )
    .then((res) => {
      setAuthTokenInAxiosInstance(res.headers['x-auth-token'])
      return { code: res.data.code, data: res.data.data, accessToken: res.headers['x-auth-token'] }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('::error in guidelines api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: e.response.data.data, accessToken: null }
    })
}
