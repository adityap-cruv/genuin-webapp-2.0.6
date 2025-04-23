import { create } from 'zustand'
import { type ProfileLoopType, type ProfileCommunityType, type ProfileVideoType } from '@lib/schemas/profile/community'
import { produce } from 'immer'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'

type State = {
  communities: ProfileCommunityType[]
  currentVideoId: string | null
}

type Actions = {
  open: (videoId: string) => void
  close: () => void
  // setCurrentVideoId: (newVideoId: string) => void
  reset: () => void
  addLoops: (communityId: string, loops: ProfileLoopType[]) => void
  addCommunities: (communities: ProfileCommunityType[]) => void
  addVideos: (communityId: string, loopId: string, videos: ProfileVideoType[]) => void
  replaceCommunities: (communities: ProfileCommunityType[]) => void
  handleCommunityJoin: (communityId: string, role: CommunityUserRoleType) => void
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
        return { ...initialState }
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
    replaceCommunities(newCommunities) {
      set((state) => {
        state.communities = newCommunities
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
      })
    },
    handleCommunityJoin(communityId, role) {
      set(
        produce((state: State) => {
          const communityIndex = state.communities.findIndex((currentItem) => currentItem.id === communityId)
          if (communityIndex !== -1) {
            state.communities[communityIndex].userRole = role
          }
        })
      )
    },
  }
})
