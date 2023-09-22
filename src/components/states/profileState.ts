import { create } from 'zustand'

interface ProfileState {
  profileData: {}
  setProfileData: (data: any) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileData: {},
  setProfileData: (data) => set(() => ({ profileData: data })),
}))
