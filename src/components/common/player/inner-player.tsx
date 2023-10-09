import OpenPlayerJS from 'openplayerjs'
import { DetailedHTMLProps, MutableRefObject, VideoHTMLAttributes, useEffect, useRef, useState } from 'react'

interface Props extends DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
  videoSizeBox: { width: number; height: number }
  videoSource: string
}

export function InnerPlayer({ videoSizeBox, videoSource, poster, loop, autoPlay, muted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      forceNative: true,
      showLoaderOnInit: true,
      onError: (e) => console.log('error in player::', e),
      hls: {
        startLevel: -1,
        enableWorker: true,
        emeEnabled: true,
      },
    })
    player.init().then(() => {
      player.load().then(() => {
        if (autoPlay) {
          player.play().then((_) => console.log('starts playing..'))
        }
      })
    })
  }, [videoRef.current])

  if (videoSource)
    return (
      <video
        poster={poster}
        ref={videoRef}
        muted={muted}
        loop={loop}
        playsInline
        height={videoSizeBox.height}
        width={videoSizeBox.height * (9 / 16)}>
        <source src={videoSource} />
      </video>
    )
}
