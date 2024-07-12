import { axiosInstance } from '@/lib/api/instance'
import { useQuery } from '@tanstack/react-query'
import { validateLinkouts } from './schema'

export async function fetchLinkouts(id: number) {
  return await axiosInstance
    .get('/api/v3/linkouts', { params: { linkouts_ids: [id] } })
    .then((res) => {
      return validateLinkouts(res.data.data[0].linkouts)
    })
    .catch((e) => {
      console.log('Error in fetch linkouts::', e)
      throw new Error('Something went wrong while fetching linkouts.')
    })
}

export function getLinkouts(id: number) {
  return useQuery({
    queryFn: async () => await fetchLinkouts(id),
    queryKey: ['linkouts', id],
  })
}
