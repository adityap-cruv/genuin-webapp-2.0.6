import { axiosInstance } from '@lib/api/instance'
import { parseCommunities, parseLoops, parsePeople, parseVideos, parseRankings } from './schema/resp-parser'
import { validateRecentsResp, validateSuggestionsResp } from './schema/suggestions-resp'

export async function getTopResults(query: string) {
  return await axiosInstance
    .get('/api/v3/search/top', {
      params: {
        query_string: query,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return {
        communities: parseCommunities(resData.communities),
        loops: parseLoops(resData.loops),
        people: parsePeople(resData.people),
        videos: parseVideos(resData.videos),
        rankings: parseRankings(resData.ranking),
      }
    })
    .catch((e) => {
      throw new Error('Something went wrong in top api.')
    })
}

export async function fetchSuggestions(query: string) {
  return await axiosInstance
    .get('/api/v3/search/suggestions', {
      params: {
        query_string: query,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return validateSuggestionsResp(resData)
    })
    .catch((e) => {
      throw new Error('Something went wrong..')
    })
}

export async function fetchRecents() {
  return await axiosInstance
    .get('/api/v3/global_search/recent')
    .then((res) => {
      const resData = res.data.data
      return validateRecentsResp(resData.recent_searches)
    })
    .catch((e) => {
      throw new Error('Something went wrong...')
    })
}

export async function deleteRecent(id?: string, all?: boolean) {
  return await axiosInstance
    .delete('/api/v3/global_search/recent', {
      params: { id, delete_all: all },
    })
    .then((res) => {
      return true
    })
    .catch((e) => {
      return false
    })
}

// This is low priority api no need handle error and success.
export function postRecents(type: number, id?: string, text?: string) {
  axiosInstance
    .post('/api/v3/global_search/recent', { type, text, search_content_id: id })
    .then((res) => {})
    .catch((e) => {
      // console.log('error::', e)
      // throw new Error('Something went wrong..')
    })
}
