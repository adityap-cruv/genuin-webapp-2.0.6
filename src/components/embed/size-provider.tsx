'use client'
import { rudderStackIdentify } from '@/services/useRudderAnalytics'
import { setBrandIdInAxiosInstance } from '@lib/api/instance'
import { type ConfigType, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import Analytics from '@services/analytics'
import { useParams } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { create } from 'zustand'

type State = {
  showMobileView: boolean
  width: number
  height: number
  isLoading: boolean
  sizeBox: VideoSizeBoxType
  config: ConfigType | undefined
}

type Actions = {
  setSizes: (width: number, height: number, config?: ConfigType) => void
}

export const useSizeStore = create<State & Actions>((set) => {
  return {
    showMobileView: true,
    isLoading: true,
    width: 0,
    height: 0,
    sizeBox: { width: 0, height: 0 },
    config: undefined,
    setSizes(width, height, config) {
      const sizeBox: VideoSizeBoxType = width < 600 ? { width, height } : { width: height * (9 / 16), height }
      set({ isLoading: false, width, height, showMobileView: width < 600, sizeBox, config })
    },
  }
})

export function SizeProvider({ children, config }: { children: ReactNode; config?: ConfigType }) {
  const params = useParams()
  const { setSize, isLoading } = useSizeStore((state) => ({ setSize: state.setSizes, isLoading: state.isLoading }))

  useEffect(() => {
    setSize(window.innerWidth, window.innerHeight, config)
    setBrandIdInAxiosInstance(Number(config?.brand_id))
    void rudderStackIdentify()
    void Analytics.track({ eventName: 'embed_viewed', properties: { embed_id: params.id as string } })
  }, [])

  if (!isLoading) return children
}
