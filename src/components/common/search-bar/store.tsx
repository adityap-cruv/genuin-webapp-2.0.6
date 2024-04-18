import { create } from 'zustand'

type ViewType = 'SUGGESTION' | 'TABS' | 'RECENT'

type TabType = 'TOP' | 'POSTS' | 'COMMUNITIES' | 'LOOPS' | 'PEOPLE'

type StatesType = {
  view: ViewType
  defaultTab: TabType
  keyword: string
  // to control the behavior of close and open modal
  focusOnInput: boolean
  focusOnModal: boolean
}

type ActionsType = {
  setView: (view: ViewType, tab?: TabType) => void
  setKeyword: (value: string) => void
  updateFocus: (focusOnInput?: boolean, focusOnModal?: boolean) => void
}

const initialState: StatesType = {
  view: 'RECENT',
  defaultTab: 'TOP',
  keyword: '',
  focusOnInput: false,
  focusOnModal: false,
}

export const useSearchBarStore = create<StatesType & ActionsType>((set) => {
  return {
    ...initialState,
    setView(view, tabType = 'TOP') {
      set({ view, defaultTab: tabType })
    },
    setKeyword(value) {
      value.length === 0 ? set({ keyword: value, view: 'RECENT' }) : set({ keyword: value, view: 'SUGGESTION' })
    },
    updateFocus(focusOnInput, focusOnModal) {
      // if (typeof focusOnInput !== 'undefined') set({ focusOnInput })
      // if (typeof focusOnModal !== 'undefined') set({ focusOnModal })
      set((state) => {
        if (typeof focusOnInput !== 'undefined') state.focusOnInput = focusOnInput
        if (typeof focusOnModal !== 'undefined') state.focusOnModal = focusOnModal
        if (!state.focusOnInput && !state.focusOnModal) {
          state.keyword = ''
          state.defaultTab = 'TOP'
          state.view = 'RECENT'
        }
        return { ...state }
      })
    },
  }
})
