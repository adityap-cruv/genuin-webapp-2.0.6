import { useRef, useEffect } from 'react'
import OpenPlayerJS from 'openplayerjs'
import { useInView } from 'motion/react'
import { useCommentStore } from './store'
import Image from 'next/image'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useGenuinOptions } from '@lib/stores/genuin-options'

type Props = {
  // videoSizeBox: { width: number; height: number }
  videoSource?: string
  poster: string
  onClick: () => void
  isFirstElement?: boolean
  commentShareString: string
}

export function CommentPlayer({ videoSource, poster, commentShareString, onClick }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const localRef = useRef<{
    loaded: boolean
    playing: boolean
    player: OpenPlayerJS | null
  }>({
    loaded: false,
    playing: false,
    player: null,
  })
  const elementIsInView = useInView(videoRef, { amount: 'some' })
  const activeCommentIndex = useCommentStore((state) => state.activeCommentIndex)
  const hasFocus = useGenuinOptions().userHasFocus
  const shouldPlay = activeCommentIndex === commentShareString && elementIsInView && hasFocus

  useEffect(() => {
    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'fit',
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
        if (shouldPlay) {
          void player.play()
        }
        localRef.current.player = player
      })
    })
  }, [])

  useEffect(() => {
    const player = localRef.current.player
    if (!player) return
    if (shouldPlay) {
      void player.play()
    } else {
      player.pause()
    }
  }, [shouldPlay])

  return (
    <div className="cursor-pointe relative w-[40%]" onClick={onClick}>
      <video
        className="h-full w-full rounded-2xl object-cover transition-all"
        poster={poster}
        ref={videoRef}
        src={videoSource}
        playsInline
        loop
        muted={false}
      />
      <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl">
        {!shouldPlay && (
          <span className="bg-monochrome-black/60 rounded-full p-3">
            <Image src={icPlay} alt="play" className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  )
}
