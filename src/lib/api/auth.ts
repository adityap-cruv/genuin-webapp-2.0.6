import { encryptText } from '@lib/utils'
import { axiosInstance, setAuthTokenInAxiosInstance } from './instance'
import { useGenuinOptions } from '@lib/stores/genuin-options'

type RecaptchaActionType = 'LOGIN' | 'SIGNUP'

type SignupProps = {
  name?: string
  email: string
  isAvatar?: boolean
  profileImage: string | File
  deviceId?: string
  recaptchaToken: string
  signupSource: number
  recaptchaAction: RecaptchaActionType
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
}: SignupProps): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .post(
      '/api/v3/signup',
      {
        name,
        email,
        is_avatar: isAvatar,
        device_id: encryptText(deviceId ?? ''),
        recaptcha_token: recaptchaToken,
        recaptcha_action: recaptchaAction,
        profile_image: profileImage,
        signup_source: signupSource,
        brand_id: 1429,
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
