import React, { useEffect, useRef } from 'react'
import useElementOnScreen from '../hooks/useElementOnScreen'
import OpenPlayerJs from 'openplayerjs'

export const DynamicPlayer = ({
  url,
  muted,
  onClick,
  onTimeUpdate,
  onDuration,
  onEnded,
  loop = true,
  autoPlay,
  poster = null,
  isPlaying = false
}) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const isVisible = useElementOnScreen({ root: null, rootMargin: '0px', threshold: 0.8 }, videoRef)

  // const muted = useState(mutedRef.current)

  useEffect(() => {
    const player = new OpenPlayerJs(videoRef.current, {
      controls: {
        alwaysVisible: false
      },
      hls: {
        startLevel: -1
      }
    })

    player.init().then(() => {
      player.load()
      playerRef.current = player
    })
  }, [])

  useEffect(() => {
    if (playerRef?.current) {
      if (isPlaying) {
        playerRef?.current?.play()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (isVisible) {
      // eslint-disable-next-line no-console
      player.play().then(() => { }).catch(e => console.log('error::', e))
    } else {
      player.pause()
    }
  }, [isVisible, playerRef.current])

  return <video
    ref={videoRef}
    poster={poster}
    src={url}
    muted={muted}
    autoPlay={autoPlay}
    style={{
      width: '100%',
      height: '100%'
    }}
    className='op-player'
    onClick={onClick}
    onTimeUpdate={onTimeUpdate}
    onDurationChange={onDuration}
    onEnded={onEnded}
    loop={loop}
    playsInline={true}
  />
}
