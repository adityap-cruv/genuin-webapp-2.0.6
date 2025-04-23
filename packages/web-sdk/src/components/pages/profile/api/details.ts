import { getApiUrl } from '@/utils'
import { validateProfileDetails } from '../schema/details'
import { getBaseHeaders } from '@/headers'
import { useQuery } from '@tanstack/react-query'
import { getQueryKeyForProfileDetails } from '@/utils/constants/keys'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'

export async function fetchBrandDetails(slug: string, forBrand: boolean) {
  try {
    const response = await fetch(getApiUrl('/goservices/profile/info'), {
      method: 'POST',
      headers: { ...getBaseHeaders(true) },
      body: JSON.stringify(
        forBrand ? { brand_slug: slug } : { nickname: slug },
      ),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log('data::', data.code, data)
      if (forBrand) {
        if (data.code === NOT_FOUND_ERROR_CODES.brand) {
          console.log('data::', data.code)
          throw new Error(data.code)
        }
      } else {
        if (data.code === NOT_FOUND_ERROR_CODES.user) {
          console.log('data::', data.code)
          throw new Error(data.code)
        }
      }

      throw new Error('Something went wrong in profile details API.')
    }
    return validateProfileDetails(data.data)
  } catch (e) {
    console.error('Error in fetchBrandData:', e)
    throw e
  }
}

export function getProfileDetails(slug: string, forBrand: boolean) {
  return useQuery({
    queryKey: getQueryKeyForProfileDetails(slug, forBrand),
    queryFn: () => fetchBrandDetails(slug, forBrand),
  })
}
