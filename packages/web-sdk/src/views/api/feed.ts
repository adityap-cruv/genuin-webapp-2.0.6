import { UNIQUE_USER_ID_KEY } from '@/const'
import { getApiUrl } from '@/utils'
import { getBaseHeaders } from '@/headers'

let pageSession: string | undefined = undefined
export async function fetchFeed(configs?: {
  loopIds?: string[]
  communityIds?: string[]
  lastVideoId?: string
  feedType: number
}) {
  const deviceId = localStorage.getItem(UNIQUE_USER_ID_KEY) ?? ''
  // If there is no lastVideo then reset the pageSession to undefined
  if (!configs?.lastVideoId) pageSession = undefined
  try {
    const res = await fetch(getApiUrl('/goservices/feed/embed/home'), {
      headers: getBaseHeaders(true),
      method: 'POST',
      body: JSON.stringify({
        device_id: deviceId,
        type: configs?.feedType,
        page_session: pageSession ? pageSession : undefined,
        last_video_id: configs?.lastVideoId,
        loop_ids: configs?.loopIds?.length === 0 ? undefined : configs?.loopIds,
        community_ids:
          configs?.communityIds?.length === 0
            ? undefined
            : configs?.communityIds,
      }),
    })
    const responseData = await res.json()
    pageSession = responseData.data.page_session
    return {
      feed: responseData.data.feeds,
      endOfFeed: responseData.data.end_of_feed,
    }
  } catch (e) {
    console.log('error::', e)
    throw new Error('Something went wrong!')
  }
}
