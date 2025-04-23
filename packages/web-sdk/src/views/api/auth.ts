import { ACCESS_TOKEN_KEY } from '@/const'
import { getBaseHeaders } from '@/headers'
import { type AuthUser } from '@/type'
import { getApiUrl, getEncryptedDeviceId, parseUserData } from '@/utils'

/**
 * If the user is authenticated, this function will return the user details.
 * Or else it will return null.
 * @param token
 * @param brandId
 * @returns
 */
export async function getAuthenticatedUserDetails(
  token: string,
  brandId: number,
) {
  return fetch(getApiUrl('/api/v4/sso/autologin'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      encrypted_device_id: getEncryptedDeviceId(),
      token,
      brand_id: brandId,
      device_type: 3,
      login_source: 1,
    }),
  })
    .then(async (res) => {
      if (res.ok) {
        const response = await res.json()
        const userData = parseUserData(
          response.data,
          res.headers.get('Gn-Access-Token') ?? '',
        )
        return {
          ...userData,
        } as AuthUser
      }
    })
    .catch((e) => {
      console.log('error in authenticatioin::', e)
      return undefined
    })
}

export async function miniProfile(): Promise<{ code: number; data: any }> {
  try {
    const response = await fetch(getApiUrl('/api/v3/users/mini_profile'), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (!response.ok) {
      throw new Error('Failed to fetch mini profile')
    }

    const resData = await response.json()
    return {
      code: resData.code,
      data: parseUserData(resData.data, accessToken ?? ''),
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('::error in mini_profile api::', e)
    return { code: 0, data: null } // Return a default structure in case of failure
  }
}
