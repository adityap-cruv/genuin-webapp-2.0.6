import { create } from 'zustand'

type ViewType = 'INITIAL' | 'TABS'

type TabType = 'TOP' | 'POSTS' | 'COMMUNITIES' | 'LOOPS' | 'PEOPLE'

// type DataType = Partial<{
//   communities: CommunityType[]
//   loops: LoopType[]
//   people: PeopleType[]
//   videos: VideoType[]
// }>

type StatesType = {
  view: ViewType
  defaultTab: TabType
}

type ActionsType = {
  setView: (view: ViewType, tab?: TabType) => void
}

const initialState: StatesType = {
  view: 'INITIAL',
  defaultTab: 'TOP',
  // communities: undefined,
  // loops: undefined,
  // people: undefined,
  // videos: undefined,
}

export const useSearchBarStore = create<StatesType & ActionsType>((set) => {
  return {
    ...initialState,
    setView(view, tabType = 'TOP') {
      set({ view, defaultTab: tabType })
    },
    // setResults({ communities, loops, people, videos }: DataType) {
    //   set({ communities, loops, people, videos })
    // },
  }
})
