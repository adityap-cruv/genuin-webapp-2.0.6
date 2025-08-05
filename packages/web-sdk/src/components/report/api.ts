import { getApiUrl } from '@/utils'
import { getBaseHeaders } from '@/headers'

const TYPE_MAPPING = {
  VIDEO: 2,
  COMMENT: 3,
}

type PerfrormReportActionPropsType = {
  contentId: string
  feedback : {
    type : number
    text : string
  }
  type: 'VIDEO' | 'COMMENT'
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


export async function performReportAction({ contentId, feedback, type }: PerfrormReportActionPropsType){
    return await fetch(getApiUrl('/api/v3/report'),{
      method : 'POST',
      headers : getBaseHeaders(true),
      body : JSON.stringify({
        content_id: contentId,
        type: TYPE_MAPPING[type],
        feedback : feedback
      })
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