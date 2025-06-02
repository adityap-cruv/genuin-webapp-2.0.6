import Analytics from '@/services/analytics'
import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import type OpenPlayerJS from 'openplayerjs'
import { getVideoPlayerConfigs } from './utils'
import { type WebConfigs } from '@/lib/stores/genuin-options'
import { usePlayerControlStore } from './player-control-store'

// Helper functions for analytics
function triggerAnalyticsForVideoStart(videoId: string, latency: number) {
  void Analytics.track({
    eventName: 'Video Started',
    properties: {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: 'feed',
      event_target_screen: 'none',
      latency,
    },
  })
}

// Create a type using the return type of getVideoPlayerConfigs plus hasStarted
type PlayerConfig = ReturnType<typeof getVideoPlayerConfigs> & { hasStarted: boolean }

type PlayerContextType = {
  duration: number
  currentTime: number
  videoId: string
  playerRef: React.MutableRefObject<OpenPlayerJS | null>
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  playerConfigRef: React.MutableRefObject<PlayerConfig>
  showScrubber: boolean
  /**
   * Whether to show seeker for player or not.
   */
  showSeeker: boolean
  // Methods
  setTimeState: (currentTime: number, duration: number) => void
  setShowScrubber: (show: boolean) => void
  resetPlayerConfig: (webConfigs?: WebConfigs) => void
  play: (player: OpenPlayerJS) => Promise<void>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

interface VideoProviderProps {
  children: React.ReactNode
  videoId: string
}

export const PlayerProvider = ({ children, videoId }: VideoProviderProps) => {
  const { toggleMuted, setPlayingState, buttonAction, playingState } = usePlayerControlStore()
  // State
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showScrubber, setShowScrubber] = useState(false)

  // Refs
  const playerRef = useRef<OpenPlayerJS | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerConfigRef = useRef<PlayerConfig>({ ...getVideoPlayerConfigs(), hasStarted: false })

  // Methods
  const setTimeState = useCallback(
    (newCurrentTime: number, newDuration: number) => {
      setCurrentTime(newCurrentTime)
      setDuration(newDuration)

      const progressValue = Math.round((newCurrentTime / newDuration) * 100)

      let eventName, progressEvent

      if (progressValue >= 25 && progressValue < 26) {
        eventName = 'Video First Quartile'
      }
      if (progressValue >= 75 && progressValue < 76) {
        eventName = 'Video Third Quartile'
      }

      if (eventName) {
        progressEvent = {
          eventName,
          properties: {
            content_category: 'loop',
            content_id: videoId,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: newDuration,
            video_view_length: newCurrentTime,
          },
        }

        void Analytics.track(progressEvent)
      }
    },
    [videoId]
  )

  const resetPlayerConfig = useCallback((webConfigs?: WebConfigs) => {
    playerConfigRef.current = { ...getVideoPlayerConfigs(webConfigs), hasStarted: false }
  }, [])

  const play = useCallback(
    async (player: OpenPlayerJS) => {
      const playerConfig = playerConfigRef.current
      try {
        // Unmute video if configured to start with sound
        if (playerConfig.unmuteVideo && player.getMedia().muted) {
          toggleMuted()
        }

        // this function is used to play the video and trigger analytics
        const playWithAnalytics = async () => {
          const startTime = performance.now()
          try {
            await player.getMedia().play()
            setPlayingState('playing')
          } catch (error) {
            const errorString = error?.toString() ?? ''

            if (errorString.includes('NotAllowedError')) {
              // First try: mute and play
              if (!player.getMedia().muted) {
                toggleMuted()
                try {
                  await player.getMedia().play()
                  setPlayingState('playing')
                  return // Successfully played muted
                } catch (innerError) {
                  // If muted playback also fails, log the error
                   
                  console.warn('Failed to play even after muting:', innerError)
                }
              }

              // Show a user interaction prompt if needed
              setPlayingState('paused')
              // You might want to show a UI element here to prompt for user interaction
              return
            }

            // Handle other errors
             
            console.error('Playback error:', error)
            setPlayingState('paused')
            return
          }

          if (!playerConfigRef.current.hasStarted) {
            const endTime = performance.now()
            triggerAnalyticsForVideoStart(videoId, endTime - startTime)
            playerConfigRef.current.hasStarted = true
          }
        }

        if (playerConfig.autoplayAfter > 0) {
          setTimeout(() => {
            void playWithAnalytics()
            playerConfigRef.current.autoplayAfter = 0
          }, playerConfig.autoplayAfter * 1000)
        } else {
          await playWithAnalytics()
        }
      } catch (e) {
         
        console.error('Error playing video:', e)
        // Silently handle playback errors
      }
    },
    [videoId]
  )

  const value: PlayerContextType = {
    // State
    duration,
    currentTime,
    videoId,
    playerRef,
    videoRef,
    playerConfigRef,
    showScrubber,
    showSeeker: buttonAction === 'pause' && playingState === 'paused',

    // Methods
    setTimeState,
    setShowScrubber,
    resetPlayerConfig,
    play,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayerContext = (): PlayerContextType => {
  const context = useContext(PlayerContext)
  if (context === null) {
    throw new Error('usePlayerContext must be used within a VideoProvider')
  }
  return context
}
