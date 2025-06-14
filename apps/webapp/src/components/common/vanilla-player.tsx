import { cn } from '@/lib/utils'
import { useInView } from 'motion/react'
import OpenPlayerJS from 'openplayerjs'
import { type DetailedHTMLProps, type VideoHTMLAttributes, memo, useEffect, useRef } from 'react'
import { useState } from 'react'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  videoSource: string
}

/**
 * This player does not have any controls and is used for auto-playing videos.
 */
export const VanillaPlayer = memo(function InnerPlayer({ videoSource, className, ...props }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const inView = useInView(videoRef, { amount: 0.9, once: true })

  useEffect(() => {
    if (!videoRef.current) return
    if (inView) {
      if (videoRef.current && loaded) {
        void videoRef.current.play()
      }
    }
  }, [inView, videoRef.current, loaded])

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
        setLoaded(true)
        // if (inView) void player.play()
        //   .then((_) => {
        //     // console.log('start playing')
        //   })
        //   .catch((e) => {
        //     // console.log('something went wrong..', e)
        //   })
      })
    })
  }, [videoSource])

  return <video className={cn(className)} muted ref={videoRef} src={videoSource} playsInline {...props} />
})
