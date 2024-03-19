import axios from 'axios'
import { axiosInstance } from './instance'

export async function fetchVideoDetails(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/video_details', {
      params: {
        video_ids: [{ slug }],
      },
    })
    .then((res) => {
      // removed temporary for deployment
      // return validateVideoData(res.data.data[slug])
      return res.data.data[slug]
    })
    .catch((e) => {
      throw new Error('Something went wrong with video details api.')
    })
}

export async function fetchVideoDetailsByShareString(shareStringList: Array<{ share_string: string }>) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/video_details', {
      params: {
        video_ids: shareStringList,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong in video details api.')
    })
}

export async function videoSpark(contentId: string, type: number, spark: boolean) {
  return await axiosInstance
    .post(
      '/api/v3/spark',
      {
        content_id: contentId,
        type,
        spark,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in videoSpark api::', e.response.data)
      return { code: Number(e.response.data.code), data: undefined, accessToken: undefined }
    })
}

export async function joinCommunity(onboardingCommunities: boolean, communities: any, users: any) {
  return await axiosInstance
    .post(
      '/api/v3/spark',
      {
        onboarding_communities: onboardingCommunities,
        communities,
        users,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in joinCommunity api::', e.response.data)
      return { code: Number(e.response.data.code), data: undefined, accessToken: undefined }
    })
}

export async function createComment(onboardingCommunities: boolean, communities: any, users: any) {
  return await axiosInstance
    .post(
      '/api/v3/comment/create',
      {
        onboarding_communities: onboardingCommunities,
        communities,
        users,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      return { code: 200, data: res.data.data }
    })
    .catch((e) => {
      console.log('::error in createComment api::', e.response.data)
      return { code: Number(e.response.data.code), data: undefined, accessToken: undefined }
    })
}
