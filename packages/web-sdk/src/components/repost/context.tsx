import { fetchRepostDestinations } from '@/components/repost/api'
import { RepostCommunityListType } from '@/components/repost/schema'
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react'

type RepostModalState = {
  isOpen: boolean
  videoId: string
  repostCommunityData: RepostCommunityListType | null
  filteredRepostCommunityData: RepostCommunityListType | null
  isLoading: boolean
  searchStr: string
}

const initialState: RepostModalState = {
  isOpen: false,
  videoId: '',
  searchStr: '',
  isLoading: true,
  repostCommunityData: null,
  filteredRepostCommunityData: null,
}

type RepostModalContextType = RepostModalState & {
  open: (videoId: string) => void
  close: () => void
  getData: (videoId: string) => Promise<void>
  search: (searchStr: string) => void
}

const RepostModalContext = createContext<RepostModalContextType | undefined>(
  undefined,
)

export const RepostModalProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initialState)

  const getData = useCallback(async (videoId: string) => {
    try {
      const data = await fetchRepostDestinations(videoId)
      setState((prev) => ({
        ...prev,
        repostCommunityData: data,
        isLoading: false,
      }))
    } catch (e) {
      console.log('error in getting data::', e)
    }
  }, [])

  const search = useCallback((searchStr: string) => {
    setState((prev) => {
      if (!searchStr) {
        return { ...prev, filteredRepostCommunityData: null, searchStr }
      }

      const newData: RepostCommunityListType = []
      const data = prev.repostCommunityData ? [...prev.repostCommunityData] : []

      data?.forEach((item) => {
        const filteredChats = item.chats.filter((chat) =>
          chat.group.group_name?.includes(searchStr),
        )

        if (filteredChats.length) {
          newData.push({ ...item, chats: filteredChats })
        } else if (item.name?.includes(searchStr)) {
          newData.push(item)
        }
      })

      return { ...prev, filteredRepostCommunityData: newData, searchStr }
    })
  }, [])

  const open = useCallback(
    (videoId: string) => {
      getData(videoId)
      setState((prev) => ({ ...prev, isOpen: true, videoId }))
    },
    [getData],
  )

  const close = useCallback(() => {
    setState(initialState)
  }, [])

  return (
    <RepostModalContext.Provider
      value={{ ...state, open, close, getData, search }}>
      {children}
    </RepostModalContext.Provider>
  )
}

export const useRepostModalContext = () => {
  const context = useContext(RepostModalContext)
  if (!context) {
    throw new Error('useRepostModal must be used within a RepostModalProvider')
  }
  return context
}
