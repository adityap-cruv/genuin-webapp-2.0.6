import { create } from 'zustand'

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

export const useProfileStore = create<ProfileStateProps>((set) => ({
  profileData: {},
  setProfileData: (data) => set(() => ({ profileData: data })),
  allVideos: [],
  setAllVideos: (data) => set(() => ({ allVideos: data }) as ProfileStateProps),
  genuinVideos: [],
  setGenuinVideos: (data) => set(() => ({ genuinVideos: data }) as ProfileStateProps),
  loopVideos: [],
  setLoopVideos: (data) => set(() => ({ loopVideos: data }) as ProfileStateProps),
}))
