import { axiosInstance } from '@/lib/api/instance'

const TYPE_MAPPING = {
  VIDEO: 2,
  COMMENT: 3,
}

/**
 * Submits a report for a video or comment to the server.
 * @param contentId - The unique identifier of the content being reported (either a video or a comment).
 * @param type - The type of content being reported. In this case, it should be either `'VIDEO'` or `'COMMENT'`.
 * @param feedback - An object containing:
 *   - `type`: A numeric identifier corresponding to the selected reason for the report (e.g., index of a report reason list).
 *   - `text`: The text description or label of the selected report reason.
 *
 * @returns A boolean indicating whether the report was successfully submitted (`true`) or not (`false`).
 */

export async function report(contentId: string, type: 'VIDEO' | 'COMMENT', feedback: { type: number; text: string }) {
  return await axiosInstance
    .post('/api/v3/report', {
      content_id: contentId,
      type: TYPE_MAPPING[type],
      feedback,
    })
    .then((res) => {
      if (res.status === 200) {
        return true
      }
      return false
    })
    .catch((e) => {
      return false
    })
}
