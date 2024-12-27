import OpenPlayerJS from 'openplayerjs'
import {
  type DetailedHTMLProps,
  type ReactEventHandler,
  type VideoHTMLAttributes,
  memo,
  useEffect,
  useState,
  useRef,
} from 'react'
import { usePlayerControlStore } from './player-control-store'
import { cn, encodeVideoSourceUrl } from '@/lib/utils'
import icPlay from '@icons/player-controls/icPlay.svg'
import Image from 'next/image'
import { useShallow } from 'zustand/react/shallow'
import Analytics from '@/services/analytics'
import { Loader } from '@/components/ui/loader'
import { useUrlParams } from '@/lib/utils/ssai/urlParamResolver'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  videoSource: string
  id: string
  isActive: boolean
}

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
  ...props
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<OpenPlayerJS | null>(null)
  const [playingState, setPlayingState] = useState<'paused' | 'playing' | 'loading'>('loading')
  const { shouldPlay, muted, setTimeState } = usePlayerControlStore(
    useShallow((state) => ({
      shouldPlay: state.shouldPlay,
      muted: state.muted,
      setTimeState: state.setTimeState,
    }))
  )
  let encodedVideoSourceUrl = videoSource
  // Create a URL object to easily access query parameters
  const videoUrl = new URL(videoSource)
  // If there are no query parameters meaning either it's m3u8 without query params or mp4 file
  if (videoUrl.search) {
    const { appendParamsToUrl } = useUrlParams()
    const macrosUpdatedVideoSource = appendParamsToUrl(videoSource)
    encodedVideoSourceUrl = encodeVideoSourceUrl(macrosUpdatedVideoSource)
  }

  useEffect(() => {
    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'responsive',
      forceNative: true,
      showLoaderOnInit: true,
      onError: (e) => {
        console.log(e, 'error')
      },
      hls: {
        // debug: true,
        /**
         * Let the player decide the best quality level dynamically.
         */
        startLevel: -1,
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
      },
    })

    void player.init().then((value) => {
      void player.load().then(() => {
        if (isActive) {
          const startTime = performance.now()
          player
            .getMedia()
            .play()
            .then((_) => {
              const endTime = performance.now()
              triggerAnalyticsForVideoStart(id, endTime - startTime)
            })
            .catch((e) => {
              // console.log('something went wrong..', e)
            })
        }
        playerRef.current = player
      })
    })
  }, [videoSource])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (isActive && shouldPlay) {
      const startTime = performance.now()
      player
        .play()
        .then(() => {
          const endTime = performance.now()
          triggerAnalyticsForVideoStart(id, endTime - startTime)
        })
        .catch((e) => {})
    } else {
      player.pause()
    }
  }, [isActive, shouldPlay])

  const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> = (event) => {
    setTimeState(event.currentTarget.currentTime, event.currentTarget.duration, id)
  }

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
        onPlay={onPlay}
        onPlaying={(ev) => {
          setPlayingState('playing')
          onPlaying?.(ev)
        }}
        onError={onError}
        onTimeUpdate={onTimeUpdateEventHandler}
        onPause={(ev) => {
          setPlayingState('paused')
          onPause?.(ev)
          triggerAnalyticsForVideoPause(id)
        }}
        onEnded={(e) => {
          onEnded?.(e)
          if (loop && playerRef.current) {
            void playerRef.current.play()
          }
        }}
        onCanPlay={(e) => {
          setPlayingState('paused')
          onCanPlay?.(e)
        }}
        onLoadStart={(e) => {
          setPlayingState('loading')
          onLoadStart?.(e)
        }}
        {...props}
      />
      {playingState !== 'playing' && (
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-monochrome-black/40 p-2 transition-all duration-100',
            playingState === 'paused' || playingState === 'loading'
              ? 'scale-125 opacity-100 ease-in '
              : 'scale-100 opacity-0 ease-out'
          )}>
          {playingState === 'paused' && (
            <Image
              src={icPlay}
              alt="volume-control"
              className={cn('pointer-events-none z-10 cursor-pointer rounded-full')}
            />
          )}
          {playingState === 'loading' && <Loader size="md" />}
        </div>
      )}
    </div>
  )
})
