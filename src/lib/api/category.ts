import { axiosInstance } from './instance'

export async function getCategories(): Promise<{ code: number; data: any }> {
  return await axiosInstance
    .get('/api/v3/trending/categories_communities')
    .then((res) => {
      return { code: res.data.code, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in mini_profile api::', e.response.data.code)
      return { code: Number(e.response.data.code), data: e.response.data.data }
    })
}
