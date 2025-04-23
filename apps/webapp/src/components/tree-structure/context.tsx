import { createContext, useContext, useState } from 'react'

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
  return (
    <TreeStructureContext.Provider
      value={{
        ...restProps,
        activeVideoId: activeId,
        openPlayerModal(videoId) {
          setActiveId(videoId)
        },
        closePlayerModal() {
          setActiveId('')
        },
      }}>
      {children}
    </TreeStructureContext.Provider>
  )
}
