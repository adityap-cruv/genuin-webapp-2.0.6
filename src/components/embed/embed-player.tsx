import { type DetailedHTMLProps, type VideoHTMLAttributes, useRef } from 'react'
import OpenPlayerJS from 'openplayerjs'
import { useEffect } from 'react'
import { useEmbedPlayerState } from './embed-player-state'
import { AnimatedMuteIcon } from '@components/common/player/control-layer/animated-mute-icon'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  // videoSizeBox: { width: number; height: number }
  videoId: string
  videoSource: string
  /**
   * Pass if player is first element of list to get it playing.
   */
  isFirstElement: boolean
}

export function EmbedPlayer({ videoId, videoSource, isFirstElement, onCanPlay, ...props }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const localRef = useRef<{
    player: OpenPlayerJS | null
  }>({
    player: null,
  })
  const { activeVideoId, muted, toggleMuted } = useEmbedPlayerState()
  // const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> = (event) => {
  //   setTimeState(event.currentTarget.currentTime, event.currentTarget.duration)
  // }

  useEffect(() => {
    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'fill',
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
        // emeEnabled: true,
      },
    })
    void player.init().then((value) => {
      void player.load().then(() => {
        if (isFirstElement) {
          player
            .getMedia()
            .play()
            .then((_) => {
              // console.log('start playing')
            })
            .catch((e) => {
              // console.log('something went wrong..', e)
            })
        }
        // console.log('loadded::', activeVideoId === videoId)

        localRef.current.player = player
      })
    })
  }, [])

  useEffect(() => {
    const player = localRef.current.player
    if (!player) return
    // const startTime = performance.now()
    if (videoId === activeVideoId) {
      player
        .play()
        .then(() => {
          // const endTime = performance.now()
          // const loadingTimeMillis = endTime - startTime
          // setLatency(Math.floor(loadingTimeMillis))
          // console.log('starts playing from use effect.')
        })
        .catch((e) => {
          // console.error('error from use effect', e)
        })
    } else {
      player.pause()
    }
  }, [activeVideoId])

  return (
    <>
      <video
        className="absolute h-full w-full object-cover"
        ref={videoRef}
        src={videoSource}
        muted={muted}
        playsInline
        onCanPlay={(ev) => {
          onCanPlay?.(ev)
        }}
        {...props}
      />
      {muted && (
        <div
          className="absolute inset-0 left-2 top-2 w-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            toggleMuted()
          }}>
          <AnimatedMuteIcon />
        </div>
      )}
    </>
  )
}
