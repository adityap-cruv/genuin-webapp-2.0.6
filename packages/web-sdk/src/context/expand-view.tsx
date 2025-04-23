import { Analytics } from '@/analytics'
import React, { useState } from 'react'

type ExpandViewContextType = {
  isFullScreen: boolean
  toggleFullScreen: (video_id?: string) => void
  isCommentBoxOpen: boolean
  toggleCommentBox: () => void
}

const ExpandViewContext = React.createContext<
  ExpandViewContextType | undefined
>(undefined)

export function ExpandViewProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false)

  return (
    <ExpandViewContext.Provider
      value={{
        isFullScreen,
        toggleFullScreen: (video_id) => {
          Analytics.track(
            isFullScreen
              ? Analytics.EventNames.VideoMinimized
              : Analytics.EventNames.VideoMaximized,
            {
              video_id,
            },
          )
          setIsFullScreen(!isFullScreen)
          setIsCommentBoxOpen(false)
        },
        isCommentBoxOpen,
        toggleCommentBox: () => {
          setIsCommentBoxOpen(!isCommentBoxOpen)
        },
      }}>
      {children}
    </ExpandViewContext.Provider>
  )
}

export const useExpandViewContext = () => {
  const context = React.useContext(ExpandViewContext)
  if (!context) {
    throw new Error('Please use this component inside ExpandViewProvider.')
  }
  return context
}
