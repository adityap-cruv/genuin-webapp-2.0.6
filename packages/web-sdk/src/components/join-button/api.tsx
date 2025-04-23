import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'

// TODO: Handle auth user accessToken when using it on web-site.
/**
 * This api call is used to request to join a community.
 * It will return a code 200 if the request is successful.
 * @param communityId
 * @returns
 */
export async function requestCommunity(communityId: string | undefined) {
  if (!communityId) {
    throw new Error('Community ID is required.')
  }

  try {
    const response = await fetch(getApiUrl('/api/v3/community/join_request'), {
      method: 'POST',
      headers: {
        ...getBaseHeaders(true), // example for adding an auth token
      },
      body: JSON.stringify({
        community_id: communityId,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return true
    } else {
      // If the response is not ok, return the error code and message
      const errorCode = data.code || 500
      const errorMessage =
        data.message || 'An error occurred while requesting the community.'
      console.error(
        `Error requesting community (Code: ${errorCode}): ${errorMessage}`,
      )
      return false
    }
  } catch (e) {
    console.error('Error during community request:', e)
    return false
  }
}

/**
 * This api call is used to leave a community.
 * It will return a code 200 if the request is successful.
 * @param communityId
 * @returns
 */
export async function leaveCommunity(communityId: string | undefined) {
  if (!communityId) {
    throw new Error('Community ID is required.')
  }
  const url = new URL(getApiUrl('/api/v3/community/leave'))
  url.searchParams.append('community_id', communityId)

  try {
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: { ...getBaseHeaders(true) },
    })

    const data = await response.json()

    if (response.ok) {
      return true
    } else {
      // If the response is not ok, return the error code and message
      const errorCode = data.code || 500
      const errorMessage =
        data.message || 'An error occurred while leaving the community.'
      console.error(
        `Error leaving community (Code: ${errorCode}): ${errorMessage}`,
      )
      return false
    }
  } catch (e) {
    console.error('Error during leave community request:', e)
    return false
  }
}

/**
 * This api call is used to add users to communities.
 * It will return a code 200 if the request is successful.
 * @param onboardingCommunities
 * @param communities
 * @param users
 * @returns
 */
export async function joinCommunity(
  onboardingCommunities: boolean,
  communityId: string,
  userId: string,
) {
  try {
    const response = await fetch(getApiUrl('/api/v3/community/add_users'), {
      method: 'POST',
      headers: { ...getBaseHeaders(true) },
      body: JSON.stringify({
        onboarding_communities: onboardingCommunities,
        communities: [communityId],
        users: [{ user_id: userId }],
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return true
    } else {
      const errorCode = data.code || 500
      const errorMessage =
        data.message || 'An error occurred while joining the community.'
      console.error(
        `Error joining community (Code: ${errorCode}): ${errorMessage}`,
      )
      return false
    }
  } catch (e) {
    console.error('Error during join community request:', e)
    return false
  }
}
