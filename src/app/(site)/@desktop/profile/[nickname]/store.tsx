import { type VideoDataType } from '@lib/schemas/video'
import { create } from 'zustand'
import { fetchVideoDetailsByShareString } from '@lib/api/video'

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
  private: boolean
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

type State = {
  communities: CommunityMiniObj[]
  videoList: Array<{ shareString: string; details: null | VideoDataType }>
  currentVideoShareString: string | null
  activeIndex: number
}

type Actions = {
  open: (shareString: string) => void
  close: () => void
  setActiveIndex: (newIndex: number) => void
  setVideoDetails: (shareStrings: Array<{ share_string: string }>) => Promise<void>
  addCommunities: (list: Array<Omit<CommunityMiniObj, 'loops'>>) => void
  addLoops: (communityObj: CommunityMiniObj | number, list: Array<Omit<LoopMiniObj, 'videos'>>) => void
  addVideos: (
    communityObj: CommunityMiniObj | number,
    loopObj: LoopMiniObj | number,
    list: Array<Omit<VideoMiniObj, 'details'>>
  ) => void
  reset: () => void
}

// TODO: Here communities value is changing find why is that happening.
const initialState: State = {
  activeIndex: 0,
  videoList: [],
  currentVideoShareString: '',
  communities: [],
}

export const useCommunityListStore = create<State & Actions>((set) => {
  return {
    ...initialState,
    reset() {
      set((state) => {
        //! Didn't use initialState because initialState is having different value
        // TODO: Remove this code.
        // console.log('states::initialState::', initialState)
        // console.log('states::setStateValue::', state)
        return { activeIndex: 0, videoList: [], currentVideoShareString: '', communities: [] }
      })
    },
    open(shareString) {
      set((state) => {
        const shareStrings = state.videoList.flatMap((item) => item.shareString)
        const newActiveIndex = shareStrings.indexOf(shareString)
        if (!state.videoList[newActiveIndex].details) {
          const startIndex = newActiveIndex - 5 > -1 ? newActiveIndex - 5 : 0
          const endIndex = newActiveIndex + 5 >= shareStrings.length ? shareStrings.length - 1 : newActiveIndex + 5
          void state.setVideoDetails(shareStrings.slice(startIndex, endIndex).map((item) => ({ share_string: item })))
        }
        return { activeIndex: newActiveIndex, currentVideoShareString: shareString }
      })
    },
    close() {
      set({ currentVideoShareString: null })
    },
    setActiveIndex(newIndex) {
      set((state) => {
        const oldIndex = state.activeIndex
        if (oldIndex > newIndex) {
          const checkIndex = newIndex - 2 > -1 ? newIndex - 2 : 0
          if (!state.videoList[checkIndex].details)
            void state.setVideoDetails(
              state.videoList
                .slice(newIndex - 7 > -1 ? newIndex - 7 : 0, newIndex - 1)
                .map((item) => ({ share_string: item.shareString }))
            )
        } else {
          const checkIndex = newIndex + 2 < state.videoList.length ? newIndex + 2 : state.videoList.length - 1
          if (!state.videoList[checkIndex].details)
            void state.setVideoDetails(
              state.videoList
                .slice(checkIndex, checkIndex + 5 < state.videoList.length ? checkIndex + 5 : state.videoList.length)
                .map((item) => ({ share_string: item.shareString }))
            )
        }
        return { activeIndex: newIndex }
      })
    },
    async setVideoDetails(shareStrings) {
      if (shareStrings.length > 0) {
        const videoDetailsList = await fetchVideoDetailsByShareString(shareStrings)
        set((state) => {
          const list = state.videoList
          const shareStrings = Object.keys(videoDetailsList)
          list.forEach((item) => {
            if (shareStrings.includes(item.shareString)) item.details = videoDetailsList[item.shareString]
          })
          return { videoList: [...list] }
        })
      }
    },
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
