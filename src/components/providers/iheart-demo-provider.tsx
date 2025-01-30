'use client'
import { createContext, useContext, type ReactNode, useState, useRef, type MutableRefObject } from 'react'

type IHeartDemoContextType = {
  brandId: string
  shouldShowIHeartDemo: boolean
  renderIn: 'root' | 'modal'
  setRenderIn: React.Dispatch<React.SetStateAction<'root' | 'modal'>>
  element: HTMLElement | null
  setElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  audioStateRef: MutableRefObject<{
    duration: number
    currentTime: number
    shouldPlay: boolean
  }>
}

const IHeartDemoContext = createContext<IHeartDemoContextType>({
  brandId: '',
  shouldShowIHeartDemo: false,
  renderIn: 'root',
  setRenderIn: () => {},
  element: null,
  setElement: () => {},
  audioStateRef: { current: { duration: 0, currentTime: 0, shouldPlay: false } },
})

const considerBrandIdsToShowIHeartDemo = ['1429', '1729', '1775', '2236', '2249']

export function IHeartDemoProvider({
  children,
  brandId,
}: {
  children: ReactNode
  shouldShowDemo: boolean
  brandId: string
}) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [renderIn, setRenderIn] = useState<'root' | 'modal'>('root')
  const audioPlayerStateRef = useRef<{ duration: number; currentTime: number; shouldPlay: boolean }>({
    duration: 0,
    currentTime: 0,
    shouldPlay: true,
  })

  return (
    <IHeartDemoContext.Provider
      value={{
        brandId,
        shouldShowIHeartDemo: considerBrandIdsToShowIHeartDemo.includes(brandId.toString()),
        renderIn,
        setRenderIn,
        element,
        setElement,
        audioStateRef: audioPlayerStateRef,
      }}>
      {children}
    </IHeartDemoContext.Provider>
  )
}

export const useIHeartDemoStates = () => useContext(IHeartDemoContext)
