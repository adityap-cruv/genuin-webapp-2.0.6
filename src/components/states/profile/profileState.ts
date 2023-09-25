import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UseBoundStore, StoreApi } from 'zustand'

interface ProfileStateProps {
  profileData: {}
  setProfileData: (data: any) => void
  allVideos: []
  setAllVideos: (data: Array<any>) => void
  genuinVideos: []
  setGenuinVideos: (data: Array<any>) => void
  loopVideos: []
  setLoopVideos: (data: Array<any>) => void
}

let useStore = (set) => ({
  profileData: {},
  setProfileData: (data) => set(() => ({ profileData: data })),
  allVideos: [],
  setAllVideos: (data) => set(() => ({ allVideos: data }) as ProfileStateProps),
  genuinVideos: [],
  setGenuinVideos: (data) => set(() => ({ genuinVideos: data }) as ProfileStateProps),
  loopVideos: [],
  setLoopVideos: (data) => set(() => ({ loopVideos: data }) as ProfileStateProps),
})

useStore = devtools(useStore)

export const useProfileStore = create<ProfileStateProps>(useStore)
