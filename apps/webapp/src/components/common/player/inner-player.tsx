import OpenPlayerJS from 'openplayerjs'
import { type ReactEventHandler, memo, useEffect, useCallback, type ComponentProps } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { encodeVideoSourceUrl } from '@/lib/utils'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import Analytics from '@/services/analytics'
import { useUrlParams } from '@/lib/utils/ssai/urlParamResolver'
import { useGestureOverlayManager } from '../gestures/gesture-overlay-manager'
import { useFeedListContext } from '@/components/providers/feed-provider'
import { useSwiper } from 'swiper/react'
import { usePlayerContext } from './context'

type Props = Exclude<
  ComponentProps<'video'> & {
    videoSource: string
    id: string
    isActive: boolean
    onPlayingStateChange?: (state: 'paused' | 'playing' | 'loading') => void
  },
  'loop'
>

// This function is now only referenced - implementation moved to singleVideoContext
function triggerAnalyticsForVideoPause(videoId: string) {
  void Analytics.track({
    eventName: 'Video Paused',
    properties: {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: 'feed',
      event_target_screen: 'none',
    },
  })
}

const hlsConfigs = {
  // debug: true,
  /**
   * Let the player decide the best quality level dynamically.
   */
  startLevel: 1,
  /**
   * Use worker threads for decoding for better performance.
   */
  enableWorker: true,
  /**
   * Enable Encrypted Media Extensions (EME) if DRM is required.
   */
  emeEnabled: true,
  /**
   * Low latency mode for quicker playback start and adaptation.
   */
  lowLatencyMode: true,
  // /**
  //  * Buffer settings tuned for 1-second fragments.
  //  */
  // maxBufferLength: 6, // Buffer up to 6 seconds (can be adjusted based on use case).
  // maxBufferSize: 20 * 1000 * 1000, // Maximum buffer size in bytes (e.g., 20MB).
  // backBufferLength: 15, // Retain up to 15 seconds of back-buffer for seamless rewinding.
  /**
   * Adjust buffer settings for 2-second fragments.
   */
  maxBufferLength: 10, // Buffer up to 6 fragments (12 seconds).
  maxBufferSize: 40 * 1000 * 1000, // Maximum buffer size in bytes (e.g., 40MB).
  backBufferLength: 30, // Retain 30 seconds for seamless rewind.
  /**
   * Optimize for quicker fragment loading and adaptation.
   */
  fragLoadingTimeOut: 10000, // Timeout in milliseconds for loading fragments.
  startFragPrefetch: true, // Prefetch the next fragment to minimize stutters.
  /**
   * Ensure codec compatibility for adaptive VP9 playback.
   */
  overrideCodec: (codec: string) => codec.includes('vp09'),
  /**
   * Optimize bitrate switching by limiting to player size.
   */
  capLevelToPlayerSize: true,
  /**
   * Handle live playback smoothly for low-latency streams.
   */
  liveSyncDuration: 2.5, // Keep live playback latency low.
  liveMaxLatencyDuration: 6, // Maximum latency allowed for live streams.
  /**
   * Fallback handling for errors during playback.
   */
  // recoverDecodingError: true, // Recover from decoding errors dynamically.
  // recoverFragLoadError: true, // Attempt to reload fragments on failure.
}

export const InnerPlayer = memo(function InnerPlayer({
  videoSource,
  id,
  poster,
  loop,
  isActive,
  onEnded,
  onPlay,
  onPlaying,
  onPause,
  onError,
  onLoadStart,
  onCanPlay,
  onPlayingStateChange,
  ...props
}: Props) {
  const { brandId } = useGenuinOptions(
    useShallow((state) => ({
      brandId: state.brandId,
    }))
  )
  const {
    playerRef,
    videoRef,
    setTimeState: singleVideoSetTimeState,
    playerConfigRef,
    resetPlayerConfig,
    play: contextPlay,
  } = usePlayerContext()
  const { shouldPlay, muted, setTimeState, volume, setPlayingState, setShouldPlay, playbackSpeed } =
    usePlayerControlStore(
      useShallow((state) => ({
        shouldPlay: state.shouldPlay,
        muted: state.muted,
        setTimeState: state.setTimeState,
        volume: state.volume,
        setPlayingState: state.setPlayingState,
        toggleMuted: state.toggleMuted,
        setShouldPlay: state.setShouldPlay,
        playbackSpeed: state.playbackSpeed,
      }))
    )
  const { showGestureOverlay } = useGestureOverlayManager()
  const { currentIndex } = useFeedListContext()
  const swiper = useSwiper()
  const webConfigs = useGenuinOptions((state) => state.config.web_configs)

  let encodedVideoSourceUrl = videoSource
  if (brandId && brandId.toString() === '1729') {
    // Replace the video source URL with the OCITest URL
    encodedVideoSourceUrl = encodedVideoSourceUrl.replace('media.begenuin.com', 'ocitest.begenuin.com')
  }
  // Create a URL object to easily access query parameters
  const videoUrl = new URL(videoSource)
  // If there are no query parameters meaning either it's m3u8 without query params or mp4 file
  if (videoUrl.search) {
    const { appendParamsToUrl } = useUrlParams()
    const macrosUpdatedVideoSource = appendParamsToUrl(videoSource)
    encodedVideoSourceUrl = encodeVideoSourceUrl(macrosUpdatedVideoSource)
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed.speed
    }
  }, [playbackSpeed])

  const initializePlayer = useCallback(
    async (player: OpenPlayerJS, playAfterInit: boolean) => {
      await player.init()
      await player.load()
      setPlayingState(undefined)
      if (playAfterInit) {
        await contextPlay(player).catch(async (error) => {
          // eslint-disable-next-line no-console
          console.log('error in player', error)
        })
      }
      return player
    },
    [contextPlay, setPlayingState]
  )

  useEffect(() => {
    // Reset hasStarted when video source changes
    resetPlayerConfig(webConfigs)

    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'responsive',
      forceNative: true,
      showLoaderOnInit: true,
      onError: (e) => {
        // eslint-disable-next-line no-console
        console.error(e, 'error')
      },
      hls: hlsConfigs,
    })

    // Set initial playback speed for the new video
    videoRef.current.playbackRate = playbackSpeed.speed

    void initializePlayer(player, isActive && playerConfigRef.current.autoplay).then((initializedPlayer) => {
      playerRef.current = initializedPlayer

      // Ensure playback speed is set after initialization
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed.speed
      }
    })

    if (isActive && !playerConfigRef.current.autoplay) {
      setShouldPlay(false)
    }
  }, [videoSource])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return

    if (isActive) {
      if (shouldPlay) {
        void contextPlay(player)
      } else {
        player.pause()
      }
    } else {
      player.pause()
    }
  }, [isActive, shouldPlay, contextPlay])

  useEffect(() => {
    if (isActive && !playerConfigRef.current.autoplay) {
      setShouldPlay(false)
    }
  }, [isActive])

  const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget

      setTimeState(video.currentTime, video.duration, id)
      singleVideoSetTimeState(video.currentTime, video.duration)

      if (video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100
        if (currentIndex === 1 && progress >= 50) {
          showGestureOverlay('PLAY_PAUSE', muted)
        }
      }
    },
    [currentIndex, muted, showGestureOverlay, setTimeState]
  )

  const onCanPlayEventHandler: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onCanPlay?.(ev)
    },
    [onCanPlay]
  )

  const handlePlay: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onPlay?.(ev)
    },
    [onPlay]
  )

  const handlePlaying: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onPlaying?.(ev)
      setPlayingState('playing')
    },
    [onPlaying, setPlayingState]
  )

  const handleError: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onError?.(ev)
      setPlayingState('paused')
    },
    [onError, setPlayingState]
  )

  const handlePause: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onPause?.(ev)
      setPlayingState('paused')
      triggerAnalyticsForVideoPause(id)
    },
    [onPause, setPlayingState, id]
  )

  const handleEnded: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onEnded?.(ev)
      const { repeatCount, shouldSwipeNext } = playerConfigRef.current
      if (repeatCount > 0 && playerRef.current) {
        playerConfigRef.current.repeatCount--
        void playerRef.current.play()
        return
      } else {
        resetPlayerConfig(webConfigs)
        setShouldPlay(false)
      }

      if (shouldSwipeNext && swiper) {
        resetPlayerConfig(webConfigs)
        swiper.slideNext()
      }
    },
    [onEnded, playerConfigRef, resetPlayerConfig, playerRef, setShouldPlay, swiper, webConfigs]
  )

  const handleLoadStart: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onLoadStart?.(ev)
    },
    [onLoadStart]
  )

  return (
    <div className="relative h-full w-full">
      <video
        className="absolute h-full w-full bg-cover bg-center bg-no-repeat object-cover"
        style={{ backgroundImage: `url(${poster})` }}
        poster={poster}
        ref={videoRef}
        muted={muted}
        src={encodedVideoSourceUrl}
        playsInline
        loop={false}
        onPlay={handlePlay}
        onPlaying={handlePlaying}
        onError={handleError}
        onTimeUpdate={onTimeUpdateEventHandler}
        onPause={handlePause}
        onEnded={handleEnded}
        onLoadStart={handleLoadStart}
        onCanPlay={onCanPlayEventHandler}
        {...props}
      />
    </div>
  )
})
