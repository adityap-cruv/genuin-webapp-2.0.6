import { type VideoDataType } from '@lib/schemas/video'
import { create } from 'zustand'

export type CommunityMiniObj = {
  id: string
  slug: string
  share_string: string
  handle: string
  name: string
  dp: string | null
  conversation_count: number
  video_count: number
  loops: LoopMiniObj[]
}

export type LoopMiniObj = {
  id: string
  slug: string
  share_string: string
  name: string
  video_count: number
  videos: VideoMiniObj[]
}

export type VideoMiniObj = {
  id: string
  slug: string
  share_string: string
  thumbnail: string
  no_of_sparks: number
}

type CommunityListType = {
  open: (shareString: string) => void
  close: () => void
  communities: CommunityMiniObj[]
  videoList: Array<{ shareString: string; details: null | VideoDataType }>
  currentVideoShareString: string | null
  addCommunities: (list: Array<Omit<CommunityMiniObj, 'loops'>>) => void
  addLoops: (communityObj: CommunityMiniObj | number, list: Array<Omit<LoopMiniObj, 'videos'>>) => void
  addVideos: (
    communityObj: CommunityMiniObj | number,
    loopObj: LoopMiniObj | number,
    list: Array<Omit<VideoMiniObj, 'details'>>
  ) => void
}

export const useCommunityListStore = create<CommunityListType>((set) => {
  return {
    open(shareString) {
      set({ currentVideoShareString: shareString })
    },
    close() {
      set({ currentVideoShareString: null })
    },
    videoList: [],
    currentVideoShareString: '',
    communities: [],
    addCommunities: (list) => {
      set((x) => {
        x.communities.push(...list.map((obj) => ({ loops: [], ...obj })))
        return { ...x }
      })
    },
    addLoops: (communityObj, list) => {
      set((x) => {
        if (typeof communityObj === 'number') communityObj = x.communities[communityObj]
        if (!x.communities.includes(communityObj)) throw new Error('Community Obj: not found')
        communityObj.loops.push(...list.map((obj) => ({ videos: [], ...obj })))
        return { ...x }
      })
    },
    addVideos: (communityObj, loopObj, list) => {
      set((x) => {
        if (typeof communityObj === 'number') communityObj = x.communities[communityObj]
        if (!x.communities.includes(communityObj)) throw new Error('Community Obj: not found')
        if (typeof loopObj === 'number') loopObj = communityObj.loops[loopObj]
        if (!communityObj.loops.includes(loopObj)) throw new Error('Loop Obj: not found')
        loopObj.videos.push(...list.map((obj) => ({ details: null, ...obj })))
        x.videoList = x.communities
          .flatMap((community) => community.loops)
          .flatMap((loop) => loop.videos)
          .map((video) => ({ shareString: video.share_string, details: null }))
        return { ...x }
      })
    },
  }
})
