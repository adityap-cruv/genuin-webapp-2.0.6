import { axiosInstance } from './instance'

export async function getEmbedDetails(id: string): Promise<{ status: boolean; data: any }> {
  return await axiosInstance
    .get('/api/v3/embed', {
      params: {
        id: id,
      },
    })
    .then((res) => {
      return { status: res.status === 200, data: res.data.data }
    })
    .catch((e) => {
      throw new Error()
    })
}
