import { useBaseContext } from '@/context/base'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import { getVideoPlayerConfigs } from './utils'
import { useBrandDetails } from '@/context/brand-details'

// Define types for our refs
type PlayerRefType = {
  player: any
  isInitialized: boolean
  isInitializing: boolean
}

type PlayerContextType = {
  timeState: {
    currentTime: number
    duration: number
  }
  setTimeState: React.Dispatch<
    React.SetStateAction<{
      currentTime: number
      duration: number
    }>
  >
  showScrubber: boolean
  setShowScrubber: React.Dispatch<React.SetStateAction<boolean>>
  showSeeker: boolean
  play: () => void
  initializePlayer: (
    playState?: boolean,
    playbackSpeed?: number,
  ) => Promise<void>
  videoRef: React.RefObject<HTMLVideoElement>
  playerRef: React.MutableRefObject<PlayerRefType>
  playerConfigRef: React.MutableRefObject<any>
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { brandDetails } = useBrandDetails()
  const {
    buttonAction,
    playingState,
    setPlayingState,
    setIsVideoPlaying,
    updateMuted,
    playbackSpeed,
  } = useBaseContext()

  const [timeState, setTimeState] = useState({ currentTime: 0, duration: 0 })
  const [showScrubber, setShowScrubber] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<PlayerRefType>({
    player: null,
    isInitialized: false,
    isInitializing: false,
  })
  const playerConfigRef = useRef<any>({
    ...getVideoPlayerConfigs(brandDetails?.web_configs),
    hasStarted: false,
  })

  const initializePlayer = useCallback(
    async (playState: boolean = false, playbackSpeed?: number) => {
      const player = playerRef.current.player
      const playerConfig = playerConfigRef.current

      if (
        !player ||
        playerRef.current.isInitialized ||
        playerRef.current.isInitializing
      )
        return

      playerRef.current.isInitializing = true

      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed || 1
      }

      try {
        setPlayingState('')
        await player.init()
        await player.load()

        playerRef.current.isInitialized = true
        playerRef.current.isInitializing = false

        if (playState && playerConfig.autoplay) {
          play()
        } else {
          setIsVideoPlaying(false)
        }
      } catch (e) {
        console.error('Error initializing player', e)
        playerRef.current.isInitializing = false
      }
    },
    [playbackSpeed],
  )

  const play = useCallback(() => {
    const player = playerRef.current.player
    const playerConfig = playerConfigRef.current

    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed.speed || 1
    }

    if (!player || playerRef.current.isInitializing) return

    const tryPlay = async () => {
      const media = player.getMedia()
      if (!media) return

      try {
        // Clear loading state once media is ready
        setPlayingState('')

        // Unmute if required
        if (playerConfig.unmuteVideo && media.muted) {
          updateMuted(false)
        }

        await media.play().catch(async (error: { toString: () => string }) => {
          const errorString = error?.toString() || ''
          if (errorString.startsWith('NotAllowedError')) {
            // Try toggling muted state and retry playing
            updateMuted(true)
            // we have used setTimeout to give time for the muted state to be applied
            setTimeout(async () => {
              await media.play()
            }, 500)
          } else {
            console.error('Error playing media:', error)
          }
        })

        if (!playerConfigRef.current.hasStarted) {
          playerConfigRef.current.hasStarted = true
        }
      } catch (err) {
        console.error('Unexpected error during playback:', err)
      }
    }

    if (!playerRef.current.isInitialized) {
      return initializePlayer(true)
    }

    // Clear loading state before autoplayAfter delay
    if (playerConfig.autoplayAfter > 0) {
      setPlayingState('')
      setTimeout(() => {
        void tryPlay()
        playerConfig.autoplayAfter = 0
      }, playerConfig.autoplayAfter * 1000)
    } else {
      void tryPlay()
    }
  }, [initializePlayer, playbackSpeed])

  return (
    <PlayerContext.Provider
      value={{
        timeState,
        setTimeState,
        showScrubber,
        setShowScrubber,
        play,
        initializePlayer,
        showSeeker: buttonAction === 'pause' && playingState === 'paused',
        videoRef,
        playerRef,
        playerConfigRef,
      }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayerContext = (): PlayerContextType => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayerContext must be used within a PlayerProvider')
  }
  return context
}
