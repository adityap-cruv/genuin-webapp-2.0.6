import OpenPlayerJS from 'openplayerjs'
import { useInView } from 'framer-motion'
import { DetailedHTMLProps, VideoHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import { usePlayerControlStore } from '@lib/stores/common/player-control-store'

// todo work on why player is sendding multiple request.
interface Props extends DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
  videoSizeBox: { width: number; height: number }
  videoSource?: string
  playIfInViewport?: boolean
}

export function InnerPlayer({
  videoSizeBox,
  videoSource,
  poster,
  loop,
  playIfInViewport,
  onEnded,
  onPlay,
  onPlaying,
  onCanPlay,
  onPause,
  onError,
}: Props) {
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
  const { shouldPlay, muted } = usePlayerControlStore((state) => ({
    shouldPlay: state.shouldPlay,
    muted: state.muted,
  }))

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
        emeEnabled: true,
      },
    })
    player.init().then((value) => {
      player.load().then(() => {
        if (shouldPlay) {
          player
            .getMedia()
            .play()
            .then((_) => console.log('start playing'))
            .catch((e) => console.log('something went wrong..', e))
        }
        localRef.current.player = player
      })
    })
  }, [])

  useEffect(() => {
    const player = localRef.current.player
    if (!player) return
    if (shouldPlay && localRef.current.loaded) {
      player
        .play()
        .then(() => console.log('starts playing from use effect.'))
        .catch((e) => console.error('error from use effect', e))
    } else {
      player.pause()
    }
  }, [shouldPlay])

  if (videoSource)
    return (
      <video
        className="object-cover"
        poster={poster}
        ref={videoRef}
        muted={muted}
        loop={loop}
        src={videoSource}
        playsInline
        style={{
          height: videoSizeBox.height,
          width: videoSizeBox.width,
        }}
        onPlay={onPlay}
        onPlaying={onPlaying}
        onError={onError}
        onCanPlay={(ev) => {
          localRef.current.loaded = true
          if (onCanPlay) onCanPlay(ev)
        }}
        onPause={onPause}
        onEnded={onEnded}
      />
    )
}
