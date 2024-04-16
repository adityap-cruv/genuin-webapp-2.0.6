import { create } from 'zustand'

export type CommunityType = {
  id: string
  memberCount: number
  description?: string | null
  handle: string
  slug: string
  profileImage?: string | null
  name?: string | null
}

export type LoopType = {
  name?: string | null
  description?: string | null
  slug: string
  id: string
}

export type PeopleType = {
  id: string
  name?: string | null
  userName: string
  bio?: string | null
  profileImage?: string | null
  isAvatar: boolean
}

type ViewType = 'INITIAL' | 'TABS'

type TabType = 'TOP' | 'POSTS' | 'COMMUNITIES' | 'LOOPS' | 'PEOPLE'

type StatesType = {
  view: ViewType
  defaultTab: TabType
}

type ActionsType = {
  setView: (view: ViewType, tab?: TabType) => void
}

export const useSearchBarStore = create<StatesType & ActionsType>((set) => {
  return {
    view: 'INITIAL',
    defaultTab: 'TOP',
    setView(view, tabType = 'TOP') {
      set({ view, defaultTab: tabType })
    },
  }
})
