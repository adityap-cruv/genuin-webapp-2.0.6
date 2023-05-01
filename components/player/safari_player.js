import React, { useEffect } from 'react'

export const SafariPlayer = ({
  uniqueKey,
  videoUrl,
  playing,
  height,
  width,
  className,
  muted,
  onClick,
  onReady,
  onPlaying
}) => {
  useEffect(() => {
    // const onPause = (event) => {
    //    event.target.currentTime = 0;
    // }
    const player = document.getElementById(uniqueKey)
    if (player) {
      player.addEventListener('canplay', onReady)

      player.addEventListener('playing', onPlaying)
      // player.addEventListener('pause', onPause)

      return () => {
        player.removeEventListener('canplay', onReady)
        player.removeEventListener('playing', onPlaying)
      // player.removeEventListener("pause", onPause)
      }
    }
  }, [])

  useEffect(() => {
    const player = document.getElementById(uniqueKey)
    if (player) {
      if (playing) {
        player.play()
      } else {
        player.pause()
      }
    }
  }, [playing])

  return (
    <div
      className={className}
      height={height}
      width={width}
      onClick={onClick}
    >
      <video
        id={uniqueKey}
        playsInline
        muted={muted}
        loop
        src={videoUrl}
        type="application/x-mpegURL"
        height={height}
        width={width}
      />
    </div>

  )
}
