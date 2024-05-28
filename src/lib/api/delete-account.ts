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
}): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post('/api/v3/verify_code', {
      user_id: userId,
      otp,
      device_id: encryptText(useLocalStorage.getState().deviceId, true),
      device_type: deviceType,
    })
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e?.response?.data.code), data: e?.response?.data.data }
    })
}
