import { axiosInstance } from '@lib/api/instance'
import { validateTopResponse } from './schema/top-resp'

export async function getTopResults(query: string) {
  return await axiosInstance
    .get('/api/v3/search/top', {
      params: {
        query_string: query,
      },
    })
    .then((res) => {
      console.log('res::', res.data.data)
      return validateTopResponse(res.data.data)
    })
    .catch((e) => {
      console.log('Something went wrong with top api.')
      throw new Error('Something went wrong in top api.')
    })
}
