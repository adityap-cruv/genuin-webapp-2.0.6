import { cn } from '@/lib/utils'
import { useInView } from 'framer-motion'
import OpenPlayerJS from 'openplayerjs'
import { type DetailedHTMLProps, type VideoHTMLAttributes, memo, useEffect, useRef } from 'react'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  videoSource: string
  shouldPlay?: boolean
  considerViewPort: boolean
}

/**
 * This player does not have any controls and is used for auto-playing videos.
 */
export const VanillaPlayer = memo(function InnerPlayer({
  videoSource,
  shouldPlay,
  considerViewPort,
  className,
  ...props
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<OpenPlayerJS | null>(null)
  const inView = useInView(videoRef, { amount: 0.9, once: true })

  useEffect(() => {
    if (considerViewPort) {
      if (inView && shouldPlay) {
        void playerRef.current?.play()
      } else {
        playerRef.current?.pause()
      }
    } else {
      if (shouldPlay) {
        void playerRef.current?.play()
      } else {
        playerRef.current?.pause()
      }
    }
  }, [shouldPlay, considerViewPort, playerRef.current])

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
        if (shouldPlay && !considerViewPort) {
          void player.play()
        }
        playerRef.current = player
      })
    })
  }, [videoSource])

  return <video className={cn(className)} muted ref={videoRef} src={videoSource} playsInline {...props} />
})
