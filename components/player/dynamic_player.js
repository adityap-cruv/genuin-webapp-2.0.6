import React, { useState, useEffect } from 'react'
import { isSafari } from 'react-device-detect'
import ReactPlayer from 'react-player/lazy'
import { SafariPlayer } from './safari_player.js'

export const DynamicPlayer = ({
  isPlaying,
  url,
  muted,
  onClick,
  onProgress,
  onDuration,
  onEnded,
  onReady,
  uniqueKey,
  loop = true,
  onPlaying
}) => {
  const [inViewPort, setInViewPort] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          setInViewPort(true)
        } else {
          setInViewPort(false)
        }
      })
    })

    observer.observe(document.body)
  }, [])
  return (<>
    {!isSafari && <ReactPlayer
      key={uniqueKey}
      playing={isPlaying && inViewPort}
      url={url}
      muted={muted}
      controls={false}
      playsinline={true}
      config={{
        forceHLS: false,
        forceVideo: true
      }}
      onClick={onClick}
      className="video-wrapper"
      width="auto"
      height="100%"
      onProgress={onProgress}
      onDuration={onDuration}
      onEnded={onEnded}
      progressInterval={200}
      onReady={onReady}
      loop={loop}
      onPlay={onPlaying}
    />}

    {isSafari && <SafariPlayer
      uniqueKey={uniqueKey}
      playing={isPlaying && inViewPort}
      videoUrl={url}
      height="100%"
      width="100%"
      className="video-wrapper"
      muted={muted}
      onClick={onClick}
      onReady={onReady}
      onPlaying={onPlaying}
    />}
  </>)
}
