import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import audioCommentPlay from '@icons/audio/play.svg'
import audioCommentPause from '@icons/audio/pause.svg'
import { useInView } from 'framer-motion'
import { useCommentsStore } from './store'

type Props = {
  url: string
  onEnded?: () => void
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  onDuration?: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  waveWidth: number
  waveHeight: number
  pipeWidth: number
  gapWidth: number
  onClick: () => void
  commentShareString: string
}

export function AudioPlayer({ url, waveWidth, waveHeight, pipeWidth, gapWidth, commentShareString, onClick }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 })
  const totalProgressWidth = (progress.duration ? progress.currentTime / progress.duration : 0) * waveWidth
  const elementIsInView = useInView(elementRef, { amount: 0.5 })
  const activeCommentIndex = useCommentsStore((state) => state.activeCommentIndex)
  const shouldPlay = activeCommentIndex === commentShareString && elementIsInView

  // useEffect(() => {
  //   console.log('total::', totalProgressWidth)
  // }, [progress])
  // console.log('progress::', progress)

  const pipeHeights = useMemo(() => {
    return Array(500)
      .fill(0)
      .map(() => Math.min(0.7, Math.max(Math.random(), 0.2)))
  }, []).slice(0, waveWidth / (1.2 * pipeWidth))

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    if (shouldPlay) {
      void element.play()
    } else {
      element.pause()
    }
  }, [shouldPlay])

  return (
    <div ref={elementRef} className="flex rounded-xl border-2 border-monochrome-9 p-2">
      <button
        className="pr-4"
        onClick={() => {
          onClick?.()
        }}>
        <Image src={!shouldPlay ? audioCommentPlay : audioCommentPause} alt="volume-control" />
      </button>
      <audio
        onTimeUpdate={(e) => {
          setProgress((x) => {
            x.currentTime = audioRef.current?.currentTime ?? 0
            return { ...x }
          })
        }}
        onDurationChange={(e) => {
          setProgress((x) => {
            x.duration = audioRef.current?.duration ?? 0
            return { ...x }
          })
        }}
        ref={audioRef}
        src={url}
        loop
      />
      <div>
        <div
          className="flex items-center justify-between"
          style={{
            width: `${waveWidth}px`,
            height: `${waveHeight}px`,
          }}>
          {pipeHeights.map((x, i) => {
            const pipeHeight = x * waveHeight
            const gapWidthPassed = gapWidth * i
            const pipeWidthPassed = pipeWidth * i
            const progressWidth = Math.min(
              pipeWidth,
              Math.max(0, totalProgressWidth - gapWidthPassed - pipeWidthPassed)
            )

            return (
              <div key={i}>
                <div
                  className="relative overflow-hidden bg-monochrome-9"
                  style={{
                    height: `${pipeHeight}px`,
                    width: `${pipeWidth}px`,
                    borderRadius: `${pipeWidth}px`,
                  }}>
                  <div
                    className="absolute left-0 top-0 bg-monochrome-black"
                    style={{
                      height: `${pipeHeight}px`,
                      width: `${progressWidth}px`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
