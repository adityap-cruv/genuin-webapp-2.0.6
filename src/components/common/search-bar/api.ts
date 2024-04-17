import { axiosInstance } from '@lib/api/instance'
import { parseCommunities, parseLoops, parsePeople, parseVideos, parseRankings } from './schema/resp-parser'

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
      console.log('Something went wrong with top api.')
      throw new Error('Something went wrong in top api.')
    })
}
