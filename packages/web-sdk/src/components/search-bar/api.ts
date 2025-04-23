import {
  parseCommunities,
  parseLoops,
  parsePeople,
  parseVideos,
  parseRankings,
} from './schema/resp-parser'
import {
  validateRecentsResp,
  validateSuggestionsResp,
} from './schema/suggestions-resp'
import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'

export async function getTopResults(query: string) {
  try {
    const response = await fetch(
      getApiUrl(
        '/api/v3/search/top',
        new URLSearchParams({ query_string: query }),
      ),
      {
        method: 'GET',
        headers: getBaseHeaders(true),
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong in top api.')
    }

    const resData = (await response.json()).data

    return {
      communities: parseCommunities(resData.communities),
      loops: parseLoops(resData.loops),
      people: parsePeople(resData.people),
      videos: parseVideos(resData.videos),
      rankings: parseRankings(resData.ranking),
    }
  } catch (error) {
    throw new Error('Something went wrong in top api.')
  }
}

export async function fetchSuggestions(query: string) {
  try {
    const response = await fetch(
      getApiUrl(
        '/api/v3/search/suggestions',
        new URLSearchParams({ query_string: query }),
      ),
      {
        method: 'GET',
        headers: getBaseHeaders(true),
      },
    )

    if (!response.ok) {
      throw new Error('Something went wrong in suggestions API.')
    }

    const resData = (await response.json()).data

    return validateSuggestionsResp(resData)
  } catch (error) {
    throw new Error('Something went wrong in suggestions API.')
  }
}

export async function fetchRecents() {
  try {
    const response = await fetch(getApiUrl('/api/v3/global_search/recent'), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong in recent searches API.')
    }

    const resData = (await response.json()).data

    return validateRecentsResp(resData.recent_searches)
  } catch (error) {
    throw new Error('Something went wrong in recent searches API.')
  }
}

export async function deleteRecent(id?: string, all?: boolean) {
  try {
    const url = getApiUrl(
      '/api/v3/global_search/recent',
      new URLSearchParams({ id: id || '', delete_all: all?.toString() || '' }),
    )

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Failed to delete recent search.')
    }

    return true
  } catch (error) {
    return false
  }
}

// This is low priority api no need handle error and success.
export function postRecents(type: number, id?: string, text?: string) {
  fetch(getApiUrl('/api/v3/global_search/recent'), {
    method: 'POST',
    headers: getBaseHeaders(true),
    body: JSON.stringify({
      type,
      text,
      search_content_id: id,
    }),
  }).catch(() => {})
}
