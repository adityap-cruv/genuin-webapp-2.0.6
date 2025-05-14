import { createContext, useContext, useEffect, useState } from 'react'
import { usePlayerControlStore } from '../common/player/player-control-store'

type OtherContextProps = {
  forEmbed?: boolean
  isSelfUser?: boolean
  activeVideoId?: string
  openPlayerModal?: (videoId: string) => void
  closePlayerModal?: () => void
}

type TreeStructureContextType = OtherContextProps

const TreeStructureContext = createContext<TreeStructureContextType>({
  forEmbed: false,
  isSelfUser: false,
})

type TreeStructureProviderPropsType = OtherContextProps & {
  children: React.ReactNode
}

export function useTreeStructure() {
  const context = useContext(TreeStructureContext)
  if (!context) {
    throw new Error('Please use this component inside tree structure component.')
  }
  return context
}

export function TreeStructureProvider({ children, ...restProps }: TreeStructureProviderPropsType) {
  const [activeId, setActiveId] = useState('')
  const { isFullScreen, toggleFullScreen } = usePlayerControlStore()

  useEffect(() => {
    if (!isFullScreen) {
      setActiveId('')
    }
  }, [isFullScreen])

  return (
    <TreeStructureContext.Provider
      value={{
        ...restProps,
        activeVideoId: activeId,
        openPlayerModal(videoId) {
          setActiveId(videoId)
          toggleFullScreen(true)
        },
        closePlayerModal() {
          setActiveId('')
          toggleFullScreen(false)
        },
      }}>
      {children}
    </TreeStructureContext.Provider>
  )
}
