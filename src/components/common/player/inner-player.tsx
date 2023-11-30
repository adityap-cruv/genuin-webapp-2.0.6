import OpenPlayerJS from 'openplayerjs'
import { useInView } from 'framer-motion'
import { type DetailedHTMLProps, type ReactEventHandler, type VideoHTMLAttributes, useEffect, useRef } from 'react'
import { usePlayerControlStore } from './player-control-store'

// todo work on why player is sendding multiple request.
interface Props extends DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> {
  // videoSizeBox: { width: number; height: number }
  videoSource?: string
  isFirstElement?: boolean
}

export function InnerPlayer({
  // videoSizeBox,
  videoSource,
  poster,
  loop,
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
  const { shouldPlay, muted, setCurrentTime, setDuration } = usePlayerControlStore((state) => ({
    shouldPlay: state.shouldPlay,
    muted: state.muted,
    setDuration: state.setDuration,
    setCurrentTime: state.setCurrentTime,
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
    void player.init().then((value) => {
      void player.load().then(() => {
        if (shouldPlay) {
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
        localRef.current.player = player
      })
    })
  }, [videoSource])

  useEffect(() => {
    const player = localRef.current.player
    if (!player) return
    if (shouldPlay && localRef.current.loaded) {
      player
        .play()
        .then(() => {
          // console.log('starts playing from use effect.')
        })
        .catch((e) => {
          // console.error('error from use effect', e)
        })
    } else {
      player.pause()
    }
  }, [shouldPlay])

  const onDurationChangeEventHandler: ReactEventHandler<HTMLVideoElement> = (event) => {
    setDuration(event.currentTarget.duration)
  }

  const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> = (event) => {
    setCurrentTime(event.currentTarget.currentTime)
  }

  if (videoSource)
    return (
      <video
        className="h-full w-full object-cover"
        poster={poster}
        ref={videoRef}
        muted={muted}
        loop={loop}
        src={videoSource}
        playsInline
        // style={{
        //   height: videoSizeBox.height,
        //   width: videoSizeBox.width,
        // }}
        onPlay={onPlay}
        onPlaying={onPlaying}
        onError={onError}
        onCanPlay={(ev) => {
          localRef.current.loaded = true
          if (onCanPlay) onCanPlay(ev)
        }}
        onDurationChange={onDurationChangeEventHandler}
        onTimeUpdate={onTimeUpdateEventHandler}
        onPause={onPause}
        onEnded={onEnded}
      />
    )
}

export function ViewportPlayer({
  videoSource,
  poster,
  loop,
  isFirstElement = false,
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
  const inView = useInView(videoRef, { amount: 0.95 })

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
    void player.init().then((value) => {
      void player.load().then(() => {
        if (isFirstElement) {
          void player.play()
        }
        localRef.current.player = player
      })
    })
  }, [])

  useEffect(() => {
    const player = localRef.current.player
    // console.log('inView::', player, inView)
    if (inView && shouldPlay) {
      void player?.play().then(() => {
        // console.log('being played..')
      })
    } else {
      player?.pause()
    }
    // console.log('invew;:', inView, shouldPlay)
  }, [inView, shouldPlay])

  if (videoSource)
    return (
      <video
        className="h-full w-full object-cover"
        poster={poster}
        ref={videoRef}
        muted={muted}
        loop={loop}
        src={videoSource}
        playsInline
        // style={{
        //   height: videoSizeBox.height,
        //   width: videoSizeBox.width,
        // }}
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
