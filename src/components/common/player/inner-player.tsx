import OpenPlayerJS from 'openplayerjs'
import { useInView } from 'framer-motion'
import { DetailedHTMLProps, VideoHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'

// todo work on why player is sendding multiple request.
interface Props extends DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
  videoSizeBox: { width: number; height: number }
  videoSource?: string
  shouldPlay: boolean
  playIfInViewport?: boolean
}

export function InnerPlayer({
  videoSizeBox,
  videoSource,
  poster,
  loop,
  muted,
  shouldPlay,
  onEnded,
  onPlay,
  onPlaying,
  onCanPlay,
  onPause,
  onError,
  playIfInViewport,
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

  const isInViewport = useInView(videoRef)

  useEffect(() => {
    console.log('is in viewport::', isInViewport)
  }, [isInViewport])

  // function getSourceType(source: string) {
  //   return source.endsWith('.mp4') ? 'video/mp4' : 'application/x-mpegURL'
  // }

  // const sourceElements = Array.isArray(videoSource) ? (
  //   videoSource.map((source, index) => {
  //     if (source) return <source key={index} src={source} type={getSourceType(source)} />
  //   })
  // ) : (
  //   <source src={videoSource} type={getSourceType(videoSource)} />
  // )

  // const playOrPause = useCallback(
  //   function (player: OpenPlayerJS) {
  //     if (typeof isInViewport === 'undefined') {
  //       if (shouldPlay) {
  //         player
  //           .getMedia()
  //           .play()
  //           .then((_) => console.log('start playing'))
  //           .catch((e) => console.log('something went wrong..', e))
  //       } else {
  //         player.pause()
  //       }
  //     } else {
  //       if (shouldPlay && isInViewport) {
  //         player
  //           .getMedia()
  //           .play()
  //           .then((_) => console.log('start playing'))
  //           .catch((e) => console.log('something went wrong..', e))
  //       } else {
  //         player.pause()
  //       }
  //     }
  //   },
  //   [localRef.current.player, playIfInViewport, isInViewport]
  // )

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
      console.log('paused from use effect.')
    }
  }, [localRef.current.player])

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
        onEnded={onEnded}></video>
    )
}
