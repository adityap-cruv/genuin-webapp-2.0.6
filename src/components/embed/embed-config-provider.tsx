'use client'
import { rudderStackIdentify } from '@/services/analytics/useRudderAnalytics'
import { setBrandIdInAxiosInstance } from '@lib/api/instance'
import { type ConfigType, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import Analytics from '@services/analytics'
import { useParams } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

type State = {
  showMobileView: boolean
  width: number
  height: number
  isLoading: boolean
  sizeBox: VideoSizeBoxType
  config: ConfigType | undefined
  videoCanPlay: boolean
}

type Actions = {
  setVideoCanPlay: (status: boolean) => void
  setSizes: (width: number, height: number, config?: ConfigType) => void
}

export const useEmbedConfig = create<State & Actions>((set) => {
  return {
    showMobileView: true,
    isLoading: true,
    width: 0,
    height: 0,
    sizeBox: { width: 0, height: 0 },
    config: undefined,
    videoCanPlay: true,
    setVideoCanPlay(status) {
      set({ videoCanPlay: status })
    },
    setSizes(width, height, config) {
      const sizeBox: VideoSizeBoxType = width < 600 ? { width, height } : { width: height * (9 / 16), height }
      set({ isLoading: false, width, height, showMobileView: width < 600, sizeBox, config })
    },
  }
})

export function EmbedConfigProvider({ children, config }: { children: ReactNode; config?: ConfigType }) {
  const params = useParams()
  const { setSize, isLoading, setVideoCanPlay } = useEmbedConfig(
    useShallow((state) => ({
      setSize: state.setSizes,
      isLoading: state.isLoading,
      setVideoCanPlay: state.setVideoCanPlay,
    }))
  )

  function handleBlur() {
    setVideoCanPlay(false)
  }

  function handleFocus() {
    setVideoCanPlay(true)
  }

  useEffect(() => {
    const element = document.getElementsByTagName('body')[0]
    console.log('element::', element)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVideoCanPlay(true)
        } else {
          setVideoCanPlay(false)
        }
      })
    })
    if (element) observer.observe(element)

    setSize(window.innerWidth, window.innerHeight, config)
    setBrandIdInAxiosInstance(Number(config?.brand_id))
    void rudderStackIdentify().then((_) => {
      void Analytics.track({ eventName: 'Embed Viewed', properties: { embed_id: params.id as string } })
    })

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      if (element) {
        observer.unobserve(element)
        observer.disconnect()
      }
    }
  }, [])

  if (!isLoading) return children
}
