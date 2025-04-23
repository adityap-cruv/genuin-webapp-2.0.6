import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'
import { getQueryKeyForCategoryList } from '@/utils/constants/keys'

const TopicSchema = z.object({
  topic_id: z.string(),
  topic: z.string(),
  is_selected: z.boolean(),
})
export type Topic = z.infer<typeof TopicSchema>

const CategorySchema = z.array(
  z.object({
    topics: z.array(TopicSchema),
    entity_id: z.string(),
    title: z.string(),
  }),
)
export type Category = z.infer<typeof CategorySchema>

function validateCategoryListResp(data: any) {
  try {
    return CategorySchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong validation in category list api!!')
  }
}

// async function fetchCategoryList() {
//   return await axiosInstance
//     .get('/api/v3/category/list')
//     .then((res) => {
//       return validateCategoryListResp(res.data.data)
//     })
//     .catch((e) => {
//       // eslint-disable-next-line no-console
//       console.log('error::', e)
//       throw new Error('Something went wrong category list api.')
//     })
// }

export async function fetchCategoryList() {
  try {
    const response = await fetch(getApiUrl('/api/v3/category/list'), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong category list api.')
    }

    const resData = await response.json()
    return validateCategoryListResp(resData.data)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error::', e)
    throw new Error('Something went wrong category list api.')
  }
}

export function getCategoryList() {
  return useQuery({
    queryFn: fetchCategoryList,
    queryKey: getQueryKeyForCategoryList(),
    refetchOnMount: true,
  })
}

export async function addTopics(topics: string[]): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/api/v3/users/topics'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({ topicIds: topics }),
    })

    if (!response.ok) {
      throw new Error('Something went wrong posting topics')
    }

    return true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Something went wrong posting topics')
    return false
  }
}
