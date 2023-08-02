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
  poster = null
}) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const isVisible = useElementOnScreen({ root: null, rootMargin: '0px', threshold: 0.6 }, videoRef)

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
      player.load().then(() => player.play())
      playerRef.current = player
    })
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (isVisible) {
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
