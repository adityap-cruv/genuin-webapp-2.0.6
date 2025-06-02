import { z } from 'zod'
import { axiosInstance } from '@lib/api/instance'
import { useQuery } from '@tanstack/react-query'

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
  })
)
export type Category = z.infer<typeof CategorySchema>

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
      return true
    })
    .catch((e) => {
       
      console.log('Something went wrong posting topics')
      return false
    })
}
