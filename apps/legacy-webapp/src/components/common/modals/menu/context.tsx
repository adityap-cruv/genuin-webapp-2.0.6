'use client'
import React, { createContext, useContext, useState } from 'react'

// Combine all modal types
type ModalType = 'menu' | 'report' | 'playBackSpeed' | null

type MenuContextType = {
  changeModalType: (type: ModalType) => void
  modalType: ModalType
  videoSlug: string
  shareUrl: string
  contentId: string
}

const MenuContext = createContext<MenuContextType | null>(null)

interface MenuProviderProps {
  children: React.ReactNode
  videoSlug: string
  shareUrl: string
  contentId: string
}

export function MenuProvider({ children, videoSlug, contentId, shareUrl }: MenuProviderProps) {
  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null)

  const value: MenuContextType = {
    changeModalType: setModalType,
    modalType,
    shareUrl,
    contentId,
    videoSlug,
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export const useMenuContext = (): MenuContextType => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider')
  }
  return context
}
