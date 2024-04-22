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
  isOpen: boolean
}

type ActionsType = {
  setView: (view: ViewType, tab?: TabType) => void
  setKeyword: (value: string) => void
  updateFocus: (focusOnInput?: boolean, focusOnModal?: boolean) => void
  close: () => void
}

const initialState: StatesType = {
  view: 'RECENT',
  defaultTab: 'TOP',
  keyword: '',
  focusOnInput: false,
  focusOnModal: false,
  isOpen: false,
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
      set((state) => {
        if (typeof focusOnInput !== 'undefined') state.focusOnInput = focusOnInput
        if (typeof focusOnModal !== 'undefined') state.focusOnModal = focusOnModal
        state.isOpen = state.focusOnInput || state.focusOnModal
        return { ...state }
      })
    },
    close() {
      const searchElement = document.getElementById('search-input') as HTMLInputElement
      searchElement.value = ''
      set({ focusOnModal: false, focusOnInput: false, isOpen: false, keyword: '', defaultTab: 'TOP', view: 'RECENT' })
    },
  }
})
