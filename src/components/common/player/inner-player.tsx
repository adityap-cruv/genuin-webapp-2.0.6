import OpenPlayerJS from 'openplayerjs'
import { HTMLAttributes, useEffect, useRef } from 'react'

interface Props extends HTMLAttributes<HTMLVideoElement> {
  videoSizeBox: { width: number; height: number }
  videoSource: string
}

export function InnerPlayer({ videoSizeBox, videoSource }: Props) {
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
        player.play().then((_) => console.log('starts playing..'))
      })
    })
  }, [videoRef.current])
  console.log('render in video::')

  if (videoSource)
    return (
      <video ref={videoRef} muted playsInline height={videoSizeBox.height} width={videoSizeBox.height * (9 / 16)}>
        <source src={videoSource} />
      </video>
    )
}
