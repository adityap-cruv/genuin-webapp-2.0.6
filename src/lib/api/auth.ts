import { encryptText } from '@lib/utils'
import { axiosInstance } from './instance'

type RecaptchaActionType = 'LOGIN' | 'SIGNUP'

type SignupProps = {
  name?: string
  email: string
  isAvatar?: boolean
  profileImage: string | File
  deviceId?: string
  recaptchaToken: string
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
}: SignupProps) {
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
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    .then((res) => {
      console.log('res::', res)
      return res
    })
    .catch((e) => {
      console.log('::error in signup api::', e)
    })
}
