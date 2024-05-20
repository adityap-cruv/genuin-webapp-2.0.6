'use client'
import { type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { useEffect, type ReactNode } from 'react'
import { create } from 'zustand'

type State = {
  showMobileView: boolean
  width: number
  height: number
  isLoading: boolean
  sizeBox: VideoSizeBoxType
}

type Actions = {
  setSizes: (width: number, height: number) => void
}

export const useSize = create<State & Actions>((set) => {
  return {
    showMobileView: true,
    isLoading: true,
    width: 0,
    height: 0,
    sizeBox: { width: 0, height: 0 },
    setSizes(width, height) {
      const sizeBox: VideoSizeBoxType = width < 600 ? { width, height } : { width: height * (9 / 16), height }
      set({ isLoading: false, width, height, showMobileView: width < 600, sizeBox })
    },
  }
})

export function SizeProvider({ children }: { children: ReactNode }) {
  const { setSize, isLoading } = useSize((state) => ({ setSize: state.setSizes, isLoading: state.isLoading }))
  useEffect(() => {
    setSize(window.innerWidth, window.innerHeight)
  }, [])

  if (!isLoading) return children
}
