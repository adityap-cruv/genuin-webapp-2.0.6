import { Analytics } from '@/analytics'
import { ShouldPlayType, useBaseContext } from '@/context/base'
import React, { useContext, useEffect, useRef, useState } from 'react'

type FullScreenModalProviderProps = {
  isOpen: boolean
  openFullScreenModal: (index: number, from?: ShouldPlayType) => void
  closeFullScreenModal: () => void
}

export const FullScreenModalContext =
  React.createContext<FullScreenModalProviderProps>({
    openFullScreenModal: () => {},
    closeFullScreenModal: () => {},
    isOpen: false,
  })

type FullScreenModalProviderPropsType = {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function FullScreenModalProvider({
  children,
  defaultOpen,
}: FullScreenModalProviderPropsType) {
  const oldViewRef = useRef<ShouldPlayType>('EMBED')
  const { updateShouldPlay, updateActiveIndex, updateMuted } = useBaseContext()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (defaultOpen) {
      setIsOpen(true)
      updateShouldPlay('FULLSCREEN')
    }
  }, [defaultOpen])

  function openFullScreenModal(index: number, from?: ShouldPlayType) {
    updateActiveIndex(index)
    updateShouldPlay('FULLSCREEN')
    setIsOpen(true)
    Analytics.track(Analytics.EventNames.EmbedMaximized)
    updateMuted(false)
    if (from) {
      oldViewRef.current = from
    }
  }

  function closeFullScreenModal() {
    updateShouldPlay(oldViewRef.current)
    setIsOpen(false)
  }

  return (
    <FullScreenModalContext.Provider
      value={{
        openFullScreenModal,
        closeFullScreenModal,
        isOpen,
      }}>
      {children}
    </FullScreenModalContext.Provider>
  )
}

export const useFullScreenModalContext = () => {
  const context = useContext(FullScreenModalContext)
  if (!context)
    throw new Error(
      'Please use this component inside full screen modal context component.',
    )
  return context
}
