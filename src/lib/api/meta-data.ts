import axios from 'axios'

/**
 * type:1 -> profile
 *
 * type:2 -> community
 *
 * type:3 -> loop
 *
 * type:4 -> video
 *
 * type:5 -> brand landing page (subdomain or white label)
 *
 * type:6 -> brand slug (subdomain or white label)
 */
type MetadataPayloadType = Partial<{
  brandId: number
  username: string
  slug: string
  domain: string
  subdomain: string
}> & {
  type: number
}

export async function fetchMetadata({ type, brandId, username, slug, domain, subdomain }: MetadataPayloadType) {
  try {
    const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/web/meta_data', {
      params: {
        type,
        brand_id: brandId,
        username,
        slug,
        domain,
        subdomain,
      },
    })
    return response.data.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('error in metadata api::', error)
    // throw new Error('Something went wrong with meta_data api.')
  }
}
