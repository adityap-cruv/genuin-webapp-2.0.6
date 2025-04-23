import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react'

type ViewType = 'SUGGESTION' | 'TABS' | 'RECENT'
type TabType = 'TOP' | 'POSTS' | 'COMMUNITIES' | 'LOOPS' | 'PEOPLE'

type SearchBarState = {
  view: ViewType
  defaultTab: TabType
  keyword: string
  focusOnInput: boolean
  focusOnModal: boolean
  isOpen: boolean
}

const initialState: SearchBarState = {
  view: 'RECENT',
  defaultTab: 'TOP',
  keyword: '',
  focusOnInput: false,
  focusOnModal: false,
  isOpen: false,
}

type SearchBarContextType = SearchBarState & {
  setView: (view: ViewType, tab?: TabType) => void
  setKeyword: (value: string) => void
  updateFocus: (focusOnInput?: boolean, focusOnModal?: boolean) => void
  close: () => void
}

const SearchBarContext = createContext<SearchBarContextType | undefined>(
  undefined,
)

export const SearchBarProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initialState)

  const setView = useCallback((view: ViewType, tab: TabType = 'TOP') => {
    setState((prev) => ({ ...prev, view, defaultTab: tab }))
  }, [])

  const setKeyword = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      keyword: value,
      view: value.length === 0 ? 'RECENT' : 'SUGGESTION',
    }))
  }, [])

  const updateFocus = useCallback(
    (focusOnInput?: boolean, focusOnModal?: boolean) => {
      setState((prev) => {
        const updatedState = { ...prev }
        if (typeof focusOnInput !== 'undefined')
          updatedState.focusOnInput = focusOnInput
        if (typeof focusOnModal !== 'undefined')
          updatedState.focusOnModal = focusOnModal
        updatedState.isOpen =
          updatedState.focusOnInput || updatedState.focusOnModal
        return updatedState
      })
    },
    [],
  )

  const close = useCallback(() => {
    const searchElement = document.getElementById(
      'search-input',
    ) as HTMLInputElement
    if (searchElement) searchElement.value = ''
    setState(initialState)
  }, [])

  return (
    <SearchBarContext.Provider
      value={{ ...state, setView, setKeyword, updateFocus, close }}>
      {children}
    </SearchBarContext.Provider>
  )
}

export const useSearchBarContext = () => {
  const context = useContext(SearchBarContext)
  if (!context) {
    throw new Error('useSearchBar must be used within a SearchBarProvider')
  }
  return context
}
