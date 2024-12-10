'use client'
import { createContext, useContext, type ReactNode, useState } from 'react'

type IHeartDemoContextType = {
  shouldShowIHeartDemo: boolean
  renderIn: 'root' | 'modal'
  setRenderIn: React.Dispatch<React.SetStateAction<'root' | 'modal'>>
  element: HTMLElement | null
  setElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>
}

const IHeartDemoContext = createContext<IHeartDemoContextType>({
  shouldShowIHeartDemo: false,
  renderIn: 'root',
  setRenderIn: () => {},
  element: null,
  setElement: () => {},
})

export function IHeartDemoProvider({ children, shouldShowDemo }: { children: ReactNode; shouldShowDemo: boolean }) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [renderIn, setRenderIn] = useState<'root' | 'modal'>('root')

  return (
    <IHeartDemoContext.Provider
      value={{ shouldShowIHeartDemo: shouldShowDemo, renderIn, setRenderIn, element, setElement }}>
      {children}
    </IHeartDemoContext.Provider>
  )
}

export const useIHeartDemoStates = () => useContext(IHeartDemoContext)
