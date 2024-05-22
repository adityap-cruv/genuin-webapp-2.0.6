import { encryptText } from '@lib/utils'
import { axiosInstance } from './instance'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export async function updatePassword({
  oldPassword,
  newPassword,
}: {
  oldPassword: string
  newPassword: string
}): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post('/api/v3/update_password', {
      password: encryptText(newPassword, false),
      old_password: encryptText(oldPassword, false),
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}

export async function forgotPassword({
  email,
  deviceId,
  brandId,
}: {
  email: string
  deviceId: string
  brandId?: number
}): Promise<{ code: number; retryTime: number }> {
  return await axiosInstance
    .post('/api/v3/forgot_password', {
      email: encryptText(email, false),
      device_id: encryptText(deviceId, true),
      brand_id: useGenuinOptions.getState().brandId,
    })
    .then((res) => {
      const retryTime = res?.data?.data?.retryTime
      return { code: res.data.code, retryTime }
    })
    .catch((e) => {
      const retryTime = e?.response?.data?.data?.retryTime
      return { code: Number(e?.response?.data.code), retryTime }
    })
}

export async function setForgotPassword({
  forgotPasswordToken,
  password,
}: {
  forgotPasswordToken: string
  password: string
}): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post('/api/v3/set_forgot_password', {
      forgot_password_token: forgotPasswordToken,
      password: encryptText(password, false),
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}

export async function resetPassword(token: string): Promise<{
  code: number
  /**
   * 11 -> magic link
   * 12 -> verify email
   */
  emailType: 11 | 12 | 16
  forgotPasswordToken?: string | undefined
}> {
  return await axiosInstance
    .get('/api/v3/verify_email_token', { params: { token }, baseURL: process.env.NEXT_PUBLIC_INTERNAL_API_URL })
    .then((res) => {
      const data = res?.data?.data
      return {
        code: Number(res?.data?.code),
        emailType: data?.email_type,
        forgotPasswordToken: data?.forgot_password_token,
      }
    })
    .catch((e) => {
      console.log('ERROR in Email Verify: ', e)
      const data = e?.response?.data
      return {
        code: Number(data?.code),
        emailType: data?.data?.email_type,
        forgotPasswordToken: data?.forgot_password_token,
      }
    })
}
