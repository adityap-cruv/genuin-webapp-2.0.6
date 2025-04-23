import { getApiUrl } from '@/utils'
import { getBaseHeaders } from '@/headers'

const TYPE_MAPPING = {
  VIDEO: 2,
  COMMENT: 3,
}

type PerfrormSparkActionPropsType = {
  contentId: string
  spark: boolean
  type: 'VIDEO' | 'COMMENT'
}

export async function performSparkAction({
  contentId,
  spark,
  type,
}: PerfrormSparkActionPropsType) {
  return await fetch(getApiUrl('/api/v3/spark'), {
    method: 'POST',
    headers: getBaseHeaders(true),
    body: JSON.stringify({
      content_id: contentId,
      type: TYPE_MAPPING[type],
      spark,
    }),
  })
    .then(async (res) => {
      if (res.ok) {
        return true
      }
      return false
    })
    .catch(() => {
      return false
    })
}
