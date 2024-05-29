import { encryptText } from '@lib/utils'
import { axiosInstance } from './instance'
import { useLocalStorage } from '@lib/stores/local-storage'

export async function sendAccountDeleteCode({
  phone,
  /**
   * 1 -> sms
   * 2 -> call
   */
  verificationType,
}: {
  phone: string
  verificationType: number
}): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post('/api/v3/send_code', {
      phone: encryptText(phone, false),
      verification_type: verificationType,
      device_id: encryptText(useLocalStorage.getState().deviceId, true),
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}

export async function verifyAccountDeleteCode({
  userId,
  otp,
  /**
   * 1 -> ios
   * 2 -> android
   * 3 -> web
   */
  deviceType,
}: {
  userId: string | undefined
  otp: string | undefined
  deviceType: number
}): Promise<{ code: number; data: any; authToken: string | null }> {
  return await axiosInstance
    .post('/api/v3/verify_code', {
      user_id: userId,
      otp,
      device_id: encryptText(useLocalStorage.getState().deviceId, true),
      device_type: deviceType,
    })
    .then((res) => {
      const authToken = res.headers['x-auth-token']
      return { code: res.data.code, data: res.data.data, authToken }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data, authToken: null }
    })
}

export async function deleteUserAccount({ authToken }: { authToken: string }): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .delete('/api/v3/users/delete', {
      headers: { 'x-auth-token': authToken },
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}
