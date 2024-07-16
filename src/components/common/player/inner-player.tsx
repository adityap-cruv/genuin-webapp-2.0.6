import OpenPlayerJS from 'openplayerjs'
import {
  type DetailedHTMLProps,
  type ReactEventHandler,
  type VideoHTMLAttributes,
  memo,
  useEffect,
  useRef,
} from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useShallow } from 'zustand/react/shallow'
import Analytics from '@/services/analytics'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  videoSource: string
  id: string
  isActive: boolean
}

function triggerAnalyticsForVideoStart(videoId: string, latency: number) {
  void Analytics.track({
    eventName: 'Video Start',
    properties: {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: 'feed',
      event_target_screen: 'none',
      latency,
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
  ...props
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<OpenPlayerJS | null>(null)
  const { shouldPlay, muted, setTimeState, setIsPlaying } = usePlayerControlStore(
    useShallow((state) => ({
      shouldPlay: state.shouldPlay,
      muted: state.muted,
      setTimeState: state.setTimeState,
      setIsPlaying: state.setIsPlaying,
    }))
  )

  useEffect(() => {
    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'responsive',
      forceNative: true,
      showLoaderOnInit: true,
      onError: (e) => {},
      hls: {
        /**
         * "startLevel" option typically relates to the initial
         * quality or bitrate level at which a video stream should
         * begin playing when adaptive streaming is employed.
         */
        startLevel: -1,
        /**
         * This will make sure that player will play on other thread rather than main thread.
         */
        enableWorker: true,
        /**
         * eme -> Encrypted Media Extensions (EME)
         */
        emeEnabled: true,
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
              // console.log('start playing')
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
    <video
      className="absolute h-full w-full object-cover"
      poster={poster}
      ref={videoRef}
      muted={muted}
      src={videoSource}
      playsInline
      onPlay={onPlay}
      onPlaying={(ev) => {
        setIsPlaying(true)
        onPlaying?.(ev)
      }}
      onError={onError}
      onTimeUpdate={onTimeUpdateEventHandler}
      onPause={(ev) => {
        setIsPlaying(false)
        onPause?.(ev)
      }}
      onEnded={(e) => {
        onEnded?.(e)
        if (loop && playerRef.current) {
          void playerRef.current.play()
        }
      }}
      {...props}
    />
  )
})
