import { ComponentProps, ReactEventHandler, useCallback } from 'react'
import { useEffect } from 'react'
import { Analytics } from '@/analytics'
import { useBaseContext } from '@/context/base'
import { encodeVideoSourceUrl, getWebpUrlForImage } from '@/utils'
import { useUrlParams } from '@/utils/ssai/urlParamResolver'
import { getVideoPlayerConfigs } from './utils'
import { useSwiper } from 'swiper/react'
import { usePlayerContext } from './context'

type BasePlayerProps = ComponentProps<'video'> & {
  id: string
  shouldPlay: boolean
  index?: number
  triggerAnalytics?: boolean
  considerFocusStatus?: boolean
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

export function BasePlayer({
  id,
  poster,
  src,
  loop,
  shouldPlay,
  triggerAnalytics,
  index,
  style,
  considerFocusStatus = true,
  onEnded,
  onPlay,
  onPause,
  onPlaying,
  onError,
  onLoadStart,
  onLoadedData,
  onCanPlay,
  onLoad,
  onTimeUpdate,
  ...restProps
}: BasePlayerProps) {
  let encodedSrc = src ?? ''
  const { appendParamsToUrl } = useUrlParams()
  // Create a URL object to easily access query parameters
  const videoUrl = new URL(encodedSrc)
  // If there are no query parameters meaning either it's m3u8 without query params or mp4 file
  if (videoUrl?.search) {
    const macrosUpdatedVideoSource = appendParamsToUrl(encodedSrc)
    encodedSrc = encodeVideoSourceUrl(macrosUpdatedVideoSource)
  }
  const {
    rootFocusStatus,
    volume,
    playbackSpeed,
    setPlayingState,
    setIsVideoPlaying,
    brandDetails,
  } = useBaseContext()
  const {
    setTimeState,
    videoRef,
    playerRef,
    playerConfigRef,
    initializePlayer,
    play,
  } = usePlayerContext()
  const swiper = useSwiper()

  const pause = useCallback(() => {
    const player = playerRef.current.player

    if (!player || playerRef.current.isInitializing) return

    if (!playerRef.current.isInitialized) {
      return initializePlayer(false, playbackSpeed.speed)
    }

    void player.getMedia()?.pause()
  }, [initializePlayer, playbackSpeed])

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

  useEffect(() => {
    if (considerFocusStatus) {
      if (shouldPlay && rootFocusStatus.isInView && rootFocusStatus.isFocused) {
        play()
      } else {
        pause()
      }
    } else {
      if (shouldPlay) {
        play()
      } else {
        pause()
      }
    }
  }, [shouldPlay, rootFocusStatus.isFocused, rootFocusStatus.isInView])

  useEffect(() => {
    const element = document.getElementById(id) as HTMLVideoElement
    if (!element) return
    let hasLoggedVideoStarted = false
    let loadStartTime: number | null = null

    function handleLoadStart(e: any) {
      loadStartTime = performance.now() // Record load start time
      onLoadStart?.(e)
    }

    function handlePlay(e: any) {
      onPlay?.(e)
      const target = e.target as HTMLVideoElement

      // Calculate latency
      const playTime = performance.now() // Record play start time
      const latency = loadStartTime ? (playTime - loadStartTime).toFixed(2) : ''

      if (!hasLoggedVideoStarted) {
        triggerAnalytics &&
          Analytics.track(Analytics.EventNames.VideoStarted, {
            content_id: getId(id),
            video_id: getId(id),
            video_url: src,
            video_length: target.duration,
            video_view_length: target.currentTime,
            video_position: index,
            latency,
          })
        hasLoggedVideoStarted = true
      }

      triggerAnalytics &&
        Analytics.track(Analytics.EventNames.VideoImpression, {
          content_id: getId(id),
          video_length: target.duration,
          video_view_length: target.currentTime,
          video_position: index,
          video_id: getId(id),
          video_url: src,
        })
    }

    function handlePause(e: any) {
      onPause?.(e)
      setPlayingState('paused')
      const target = e.target as HTMLVideoElement
      if (triggerAnalytics && target.currentTime !== 0) {
        Analytics.track(Analytics.EventNames.VideoPaused, {
          content_id: getId(id),
          video_view_length: target.currentTime,
          video_length: target.duration,
          video_position: index,
        })
      }
    }

    element.addEventListener('play', handlePlay)
    element.addEventListener('pause', handlePause)
    element.addEventListener('loadstart', handleLoadStart)
    return () => {
      element.removeEventListener('play', handlePlay)
      element.removeEventListener('pause', handlePause)
      element.removeEventListener('loadstart', handleLoadStart)
    }
  }, [src])

  useEffect(() => {
    playerConfigRef.current.hasStarted = false
    setPlayingState('loading') // Set loading when src changes

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const player = new OpenPlayerJS(id, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'responsive',
      forceNative: true,
      showLoaderOnInit: true,
      onError: () => {},
      hls: hlsConfigs,
    })
    playerRef.current.player = player

    if (shouldPlay) {
      initializePlayer(true)
    }

    return () => {
      playerRef.current.player = null
      playerRef.current.isInitialized = false
    }
  }, [src])

  const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> =
    useCallback(
      (ev) => {
        onTimeUpdate?.(ev)
        setTimeState({
          currentTime: ev.currentTarget.currentTime,
          duration: ev.currentTarget.duration,
        })
      },
      [onTimeUpdate],
    )

  const onCanPlayEventHandler: ReactEventHandler<HTMLVideoElement> =
    useCallback(
      (ev) => {
        onCanPlay?.(ev)
        setPlayingState('') // Clear loading state when video is ready
      },
      [onCanPlay],
    )

  const handlePlaying: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onPlaying?.(ev)
      setPlayingState('playing')
    },
    [onPlaying],
  )

  const handleError: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onError?.(ev)
      setPlayingState('') // Clear loading state if video errors
    },
    [onError],
  )

  const handleEnded: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onEnded?.(ev)
      const { repeatCount, shouldSwipeNext } = playerConfigRef.current
      if (repeatCount > 0 && playerRef.current.player) {
        playerConfigRef.current.repeatCount--
        play()
        return
      } else {
        playerConfigRef.current = {
          ...getVideoPlayerConfigs(brandDetails?.web_configs),
          hasStarted: false,
        }
        setIsVideoPlaying(false)
      }

      if (shouldSwipeNext && swiper) {
        playerConfigRef.current = {
          ...getVideoPlayerConfigs(brandDetails?.web_configs),
          hasStarted: false,
        }

        setIsVideoPlaying(true)
        swiper.slideNext()
      }

      const target = ev.target as HTMLVideoElement
      triggerAnalytics &&
        AnalyticsForVideoEnded({
          id: getId(id),
          duration: target.duration,
          position: index ?? -1,
        })
    },
    [onEnded, swiper],
  )

  const handleLoad: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onLoad?.(ev)
    },
    [onLoad],
  )

  const handleLoadData: ReactEventHandler<HTMLVideoElement> = useCallback(
    (ev) => {
      onLoadedData?.(ev)
      setPlayingState('')
    },
    [onLoadedData],
  )

  return (
    <div className='absolute h-full w-full top-0 left-0'>
      <video
        id={id}
        ref={videoRef}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--tertiary)',
          backgroundImage: `url(${getWebpUrlForImage(poster)})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          ...style,
        }}
        poster={getWebpUrlForImage(poster)}
        playsInline
        src={encodedSrc}
        onPlaying={handlePlaying}
        onError={handleError}
        onTimeUpdate={onTimeUpdateEventHandler}
        onEnded={handleEnded}
        onLoad={handleLoad}
        onLoadedData={handleLoadData}
        onCanPlay={onCanPlayEventHandler}
        {...restProps}
      />
    </div>
  )
}

function AnalyticsForVideoEnded({
  id,
  duration,
  position,
}: {
  id: string
  duration: number
  position: number
}) {
  const properties = {
    content_id: id,
    video_length: duration,
    video_view_length: duration,
    video_position: position,
  }

  void Analytics.track(Analytics.EventNames.VideoFirstQuartile, properties)

  void Analytics.track(Analytics.EventNames.VideoWatched, properties)

  void Analytics.track(Analytics.EventNames.VideoThirdQuartile, properties)

  void Analytics.track(Analytics.EventNames.VideoCompleted, properties)
}

function getId(videoId: string) {
  const splitArr = videoId.split('__')
  return splitArr[splitArr.length - 1]
}
