import { ACCESS_TOKEN_KEY, BRAND_ID_KEY } from './const'

export type ApiBaseParamsType = {
  accessToken?: string | null
  brandId: string
}

// TODO: change the code to set accessToken in localStorage.
/**
 * This function is used to set the headers.
 * @param params
 */
export const setBaseHeaders = (params: ApiBaseParamsType) => {
  if (params.accessToken)
    localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken || '')
  localStorage.setItem(BRAND_ID_KEY, params.brandId)
}

/**
 * This function is used to replace the accessToken.
 * @param accessToken
 */
export function replaceAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

/**
 * This function is used to remove the headers.
 */
export const removeBaseHeaders = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const getBaseHeaders = (addContentTypeJson: boolean) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const brandId = localStorage.getItem(BRAND_ID_KEY)

  return {
    ...(brandId && { 'x-brand-id': brandId }),
    ...(accessToken && {
      Authorization: 'Bearer ' + accessToken,
    }),
    ...(addContentTypeJson && { 'Content-Type': 'application/json' }),
  }
}
