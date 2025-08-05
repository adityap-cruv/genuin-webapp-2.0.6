import { Analytics } from '@/analytics'
import { useBaseContext } from '@/context/base'
// import { QUERY_PARAMS_KEY_FOR_VIDEO_SLUG } from '@/const'
import React, { useEffect, useState } from 'react'
// import { useSearchParams } from '@/hooks/use-search-params'
import { useBrandDetails } from '@/context/brand-details'
import { useDeviceDetect } from '@/hooks/useDeviceDetect'

type ExpandViewContextType = {
  isFullScreen: boolean
  toggleFullScreen: (
    video_id?: string,
    activeIndex?: number,
    videoShareUrl?: string,
  ) => void
  setFullScreen: (
    isFullScreen: boolean,
    video_id?: string,
    activeIndex?: number,
    videoShareUrl?: string,
  ) => void
  isCommentBoxOpen: boolean
  toggleCommentBox: () => void
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
  isBrowserFullscreen : boolean
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
  const { embedData, action, toggleAction } = useBaseContext()
  const { customizations } = useBrandDetails()
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const { previousShouldPlay, updateShouldPlay } = useBaseContext()
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false)
  const { isMobile } = useDeviceDetect()
  // Helper functions for fullscreen
  const openFullscreen = React.useCallback(
    async (
      video_id?: string,
      newActiveIndex?: number,
      videoShareUrl?: string,
    ) => {
      if (typeof document === 'undefined') return
      const elem = document.getElementsByTagName('body')[0]
      const isInIframe = window.self !== window.top
      const canFullscreen =
        elem &&
        document.fullscreenEnabled &&
        !document.fullscreenElement &&
        typeof elem.requestFullscreen === 'function'

      if (isInIframe && canFullscreen) {
        // Only request fullscreen if window is in iframe and fullscreen is supported
        if (!isMobile) {
          try {
            await elem.requestFullscreen({ navigationUI: 'hide' })
            setIsBrowserFullscreen(true)
          } catch (error) {
            console.error('Failed to enter fullscreen mode:', error)
          }
        }
        setIsFullScreen(true)
        // setIsCommentBoxOpen(false)
        if (
          action &&
          action === 'comment' &&
          !isMobile
        ) {
          setIsCommentBoxOpen(true)
          toggleAction()
        } else {
          setIsCommentBoxOpen(false)
        }
        if (typeof newActiveIndex === 'number') setActiveIndex(newActiveIndex)
        Analytics.track(Analytics.EventNames.VideoMaximized, { video_id })
        updateShouldPlay('FULLSCREEN')
      } else if (isInIframe && !canFullscreen) {
        // In iframe but fullscreen not supported: open shareUrl in new window
        if (videoShareUrl) {
          window.open(videoShareUrl, '_blank')
        }
      } else {
        // Not in iframe: simulate fullscreen with state only (no browser fullscreen)
        setIsFullScreen(true)
        setIsBrowserFullscreen(false)
        // setIsCommentBoxOpen(false)
        if (
          action &&
          action === 'comment' &&
          !isMobile
        ) {
          setIsCommentBoxOpen(true)
          toggleAction()
        } else {
          setIsCommentBoxOpen(false)
        }
        if (typeof newActiveIndex === 'number') setActiveIndex(newActiveIndex)
        Analytics.track(Analytics.EventNames.VideoMaximized, { video_id })
        updateShouldPlay('FULLSCREEN')
      }
    },
    [updateShouldPlay, customizations, isMobile],
  )

  const closeFullscreen = React.useCallback(
    async (
      video_id?: string,
      newActiveIndex?: number,
      prevShouldPlay?: string | null,
    ) => {
      if (typeof document === 'undefined') return
      const isInIframe = window.self !== window.top

      // Only exit fullscreen if we're in iframe and there's an active fullscreen element
      if (isInIframe && document.fullscreenElement) {
        if (!isMobile) {
          try {
            await document.exitFullscreen()
          } catch (error) {
            console.error('Failed to exit fullscreen mode:', error)
          }
        }
      }

      setIsFullScreen(false)
      setIsCommentBoxOpen(false)
      if (typeof newActiveIndex === 'number') setActiveIndex(newActiveIndex)
      Analytics.track(Analytics.EventNames.VideoMinimized, { video_id })
      updateShouldPlay(
        ((prevShouldPlay as any) ??
          (customizations?.view === 'carousel' ||
            customizations?.view === 'feed'))
          ? 'EMBED'
          : 'STANDARD_WALL',
      )
    },
    [updateShouldPlay, isMobile],
  )

  // Common handler for entering/exiting fullscreen
  const handleFullScreenChange = React.useCallback(
    async (
      shouldBeFullScreen: boolean,
      video_id?: string,
      newActiveIndex?: number,
      prevShouldPlay?: string | null,
      videoShareUrl?: string,
    ) => {
      if (shouldBeFullScreen) {
        await openFullscreen(video_id, newActiveIndex, videoShareUrl)
      } else {
        await closeFullscreen(video_id, newActiveIndex, prevShouldPlay)
      }
    },
    [openFullscreen, closeFullscreen],
  )

  const toggleFullScreen = React.useCallback(
    async (
      video_id?: string,
      newActiveIndex?: number,
      videoShareUrl?: string,
    ) => {
      if (!isFullScreen) {
        await openFullscreen(video_id, newActiveIndex, videoShareUrl)
      } else {
        await closeFullscreen(video_id, newActiveIndex, previousShouldPlay)
      }
    },
    [isFullScreen, previousShouldPlay, openFullscreen, closeFullscreen],
  )

  useEffect(() => {
    function handleFullscreenChange() {
      if (typeof document !== 'undefined') {
        if (!document.fullscreenElement) {
          closeFullscreen(undefined, undefined, previousShouldPlay)
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [previousShouldPlay, updateShouldPlay])

  const setFullScreen = React.useCallback(
    async (
      shouldBeFullScreen: boolean,
      video_id?: string,
      newActiveIndex?: number,
      videoShareUrl?: string,
    ) => {
      await handleFullScreenChange(
        shouldBeFullScreen,
        video_id,
        newActiveIndex,
        previousShouldPlay,
        videoShareUrl,
      )
    },
    [previousShouldPlay, handleFullScreenChange],
  )

  const toggleCommentBox = React.useCallback(() => {
    setIsCommentBoxOpen((prev) => !prev)
  }, [])

  // const { has: queryHas, get: queryGet } = useSearchParams()

  useEffect(() => {
    const videoSlug = embedData?.startVideoSlug
    console.log('videoSlug', videoSlug)
    if (videoSlug) {
      // If a video slug is provided, open the fullscreen view for that video
      openFullscreen(videoSlug, 0)
    }
    // if (queryHas(QUERY_PARAMS_KEY_FOR_VIDEO_SLUG)) {
    //   const videoSlug = queryGet(QUERY_PARAMS_KEY_FOR_VIDEO_SLUG)
    //   if (videoSlug) {
    //     // setStartVideoSlug(videoSlug)
    //     openFullscreen(videoSlug, 0)
    //   }
    // }
  }, [])

  return (
    <ExpandViewContext.Provider
      value={{
        isFullScreen,
        activeIndex,
        setActiveIndex,
        toggleFullScreen,
        setFullScreen,
        isCommentBoxOpen,
        toggleCommentBox,
        isBrowserFullscreen,
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
