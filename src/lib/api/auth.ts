import { encryptText } from '@lib/utils'
import { axiosInstance } from './instance'

export type AuthActionType = 'JOIN_COMMUNITY' | 'SUBSCRIBE' | 'KS_CB_REQUEST'

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
