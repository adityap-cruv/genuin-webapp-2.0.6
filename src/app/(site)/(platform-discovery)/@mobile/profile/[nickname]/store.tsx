import { create } from 'zustand'
import { type ProfileLoopType, type ProfileCommunityType, type ProfileVideoType } from '@lib/schemas/profile/community'

type State = {
  communities: ProfileCommunityType[]
  currentVideoId: string | null
}

type Actions = {
  open: (videoId: string) => void
  close: () => void
  // setCurrentVideoId: (newVideoId: string) => void
  reset: () => void
  addLoops: (communyId: string, loops: ProfileLoopType[]) => void
  addCommunities: (communities: ProfileCommunityType[]) => void
  addVideos: (communityId: string, loopId: string, videos: ProfileVideoType[]) => void
}

// TODO: Here communities value is changing find why is that happening.
const initialState: State = {
  communities: [],
  currentVideoId: null,
}

export const useCommunityListStore = create<State & Actions>((set) => {
  return {
    ...initialState,
    reset() {
      set((state) => {
        return { activeIndex: 0, videoList: [], currentVideoShareString: '', communities: [] }
      })
    },
    open(videoId) {
      set({ currentVideoId: videoId })
    },
    close() {
      set({ currentVideoId: null })
    },
    addCommunities(newCommunities) {
      set((state) => {
        const communities = state.communities
        state.communities = [...communities, ...newCommunities]
        return { ...state }
      })
    },
    addLoops(communityId, newLoops) {
      set((state) => {
        const communityIndex = state.communities.findIndex((currentItem, index, arr) => {
          return currentItem.id === communityId
        })
        const loops = state.communities[communityIndex].loops
        state.communities[communityIndex].loops = [...loops, ...newLoops]
        return { ...state }
      })
    },
    addVideos(communityId, loopId, newVideos) {
      set((state) => {
        const communityIndex = state.communities.findIndex((currentItem, index, arr) => {
          return currentItem.id === communityId
        })
        const loopIndex = state.communities[communityIndex].loops.findIndex((currentItem, index, arr) => {
          return currentItem.id === loopId
        })

        const videos = state.communities[communityIndex].loops[loopIndex].videos

        state.communities[communityIndex].loops[loopIndex].videos = [...videos, ...newVideos]
        return { ...state }
      }, true)
    },
  }
})
