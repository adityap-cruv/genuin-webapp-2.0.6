import { UNIQUE_USER_ID_KEY } from '@/const'
import { getApiUrl } from '@/utils'
import { getBaseHeaders } from '@/headers'
import { SDKConfig } from '@/type'

let pageSession: string | undefined = undefined
export async function fetchFeed(configs?: {
  loopIds?: string[]
  communityIds?: string[]
  lastVideoId?: string
  feedType: number
  contextualParams: SDKConfig['contextualParams']
  brandIds?: number[]
}) {
  const deviceId = localStorage.getItem(UNIQUE_USER_ID_KEY) ?? ''
  // If there is no lastVideo then reset the pageSession to undefined
  if (!configs?.lastVideoId) pageSession = undefined
  try {
    const contextualFeedParamsBody = {
      // Basic context
      ...(configs?.contextualParams?.page_context && {
        page_context: configs?.contextualParams?.page_context,
      }),
      ...(configs?.contextualParams?.previous_page_context && {
        previous_page_context: configs?.contextualParams?.previous_page_context,
      }),
      ...(configs?.contextualParams?.user_context && {
        user_context: configs?.contextualParams?.user_context,
      }),
      
      // Geographic context
      ...((configs?.contextualParams?.geo?.lat ||
        configs?.contextualParams?.geo?.long) && {
        geo: {
          lat: typeof configs.contextualParams.geo.lat === 'number' 
            ? configs.contextualParams.geo.lat 
            : parseFloat(String(configs.contextualParams.geo.lat || '')),
          long: typeof configs.contextualParams.geo.long === 'number' 
            ? configs.contextualParams.geo.long 
            : parseFloat(String(configs.contextualParams.geo.long || '')),
          ...(configs.contextualParams.geo.radius_limit && {
            radius_limit: configs.contextualParams.geo.radius_limit,
          }),
        },
      }),
      
      // Place context
      ...(configs?.contextualParams?.place && 
        (configs.contextualParams.place.country || 
         configs.contextualParams.place.state || 
         configs.contextualParams.place.city || 
         configs.contextualParams.place.zipcode) && {
        place: {
          ...(configs.contextualParams.place.country && {
            country: configs.contextualParams.place.country,
          }),
          ...(configs.contextualParams.place.state && {
            state: configs.contextualParams.place.state,
          }),
          ...(configs.contextualParams.place.city && {
            city: configs.contextualParams.place.city,
          }),
          ...(configs.contextualParams.place.zipcode && {
            zipcode: configs.contextualParams.place.zipcode,
          }),
        },
      }),
      
      // User segmentation
      ...(configs?.contextualParams?.user_segments && 
        (configs.contextualParams.user_segments.age || 
         configs.contextualParams.user_segments.min_age || 
         configs.contextualParams.user_segments.max_age || 
         configs.contextualParams.user_segments.segment || 
         configs.contextualParams.user_segments.gender || 
         configs.contextualParams.user_segments.race) && {
        user_segments: {
          ...(configs.contextualParams.user_segments.age && {
            age: configs.contextualParams.user_segments.age,
          }),
          ...(configs.contextualParams.user_segments.min_age && {
            min_age: configs.contextualParams.user_segments.min_age,
          }),
          ...(configs.contextualParams.user_segments.max_age && {
            max_age: configs.contextualParams.user_segments.max_age,
          }),
          ...(configs.contextualParams.user_segments.segment && {
            segment: configs.contextualParams.user_segments.segment,
          }),
          ...(configs.contextualParams.user_segments.gender && {
            gender: configs.contextualParams.user_segments.gender,
          }),
          ...(configs.contextualParams.user_segments.race && {
            race: configs.contextualParams.user_segments.race,
          }),
        },
      }),
      
      // Targeting arrays
      ...(configs?.contextualParams?.brands_ids?.length && {
        brands_ids: configs.contextualParams.brands_ids,
      }),
      ...(configs?.contextualParams?.user_interests?.length && {
        user_interests: configs.contextualParams.user_interests,
      }),
      ...(configs?.contextualParams?.posted_by_user_ids?.length && {
        posted_by_user_ids: configs.contextualParams.posted_by_user_ids,
      }),
      ...(configs?.contextualParams?.community_ids?.length && {
        community_ids: configs.contextualParams.community_ids,
      }),
      ...(configs?.contextualParams?.loop_ids?.length && {
        loop_ids: configs.contextualParams.loop_ids,
      }),
      
      // Time context
      ...(configs?.contextualParams?.time && {
        time: configs.contextualParams.time,
      }),
      
      // URL context (always include current URL)
      ...{
        url: window.location.href,
      },
    }
    const brandIds =
      configs?.brandIds?.length === 0 ? undefined : configs?.brandIds
    const res = await fetch(getApiUrl('/goservices/feed/embed/home'), {
      headers: getBaseHeaders(true, brandIds),
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
        ...contextualFeedParamsBody,
        ...(brandIds && {
          brand_ids: brandIds,
        }),
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
