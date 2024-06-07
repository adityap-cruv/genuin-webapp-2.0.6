import { z } from 'zod'
import { axiosInstance } from '@lib/api/instance'
import { useQuery } from '@tanstack/react-query'

const TopicSchema = z.object({
  topic_id: z.string(),
  topic: z.string(),
  is_selected: z.boolean(),
})

const CategorySchema = z.array(
  z.object({
    topics: z.array(TopicSchema),
    entity_id: z.string(),
    title: z.string(),
  })
)

function validateCategoryListResp(data: any) {
  try {
    return CategorySchema.parse(data)
  } catch (e) {
    throw new Error('Something went wrong validation in category list api!!')
  }
}

async function fetchCategoryList() {
  return await axiosInstance
    .get('/api/v3/category/list')
    .then((res) => {
      return validateCategoryListResp(res.data.data)
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error::', e)
      throw new Error('Something went wrong category list api.')
    })
}

export function getCategoryList() {
  return useQuery({ queryFn: fetchCategoryList, queryKey: ['categories'] })
}

export async function addTopics(topics: string[]) {
  return await axiosInstance
    .post('/api/v3/users/topics', { topicIds: topics })
    .then((res) => {
      if (res.status === 200) {
        return true
      }
      return false
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('Something went wrong posting topics')
      return false
    })
}
