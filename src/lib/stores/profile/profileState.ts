import { create } from 'zustand'

type ProfileStateProps = {
  profileData: Record<string, unknown>
  setProfileData: (data: any) => void
  allVideos: []
  setAllVideos: (data: any[]) => void
  genuinVideos: []
  setGenuinVideos: (data: any[]) => void
  loopVideos: []
  setLoopVideos: (data: any[]) => void
}

export const useProfileStore = create<ProfileStateProps>((set) => ({
  profileData: {},
  setProfileData: (data) => {
    set(() => ({ profileData: data }))
  },
  allVideos: [],
  setAllVideos: (data) => {
    set(() => ({ allVideos: data }) as any)
  },
  genuinVideos: [],
  setGenuinVideos: (data) => {
    set(() => ({ genuinVideos: data }) as any)
  },
  loopVideos: [],
  setLoopVideos: (data) => {
    set(() => ({ loopVideos: data }) as any)
  },
}))
