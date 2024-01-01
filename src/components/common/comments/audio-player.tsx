import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import audioCommentPlay from '@icons/audio/play.svg'
import audioCommentPause from '@icons/audio/pause.svg'
import { useInView } from 'framer-motion'
import { useCommentStore } from './store'

type Props = {
  url: string
  onEnded?: () => void
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  onDuration?: (e: React.SyntheticEvent<HTMLAudioElement, Event>) => void
  onClick: () => void
  commentShareString: string
}

// TODO: optimize this component.
export function AudioPlayer({ url, commentShareString, onClick }: Props) {
  const [waveWidth, setWaveWidth] = useState(170)
  const waveHeight = waveWidth * (1 / 7)
  const pipeWidth = Math.min(5, waveWidth * (5 / 170))
  const gapWidth = Math.min(2, waveWidth * (2 / 170))
  const audioRef = useRef<HTMLAudioElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 })
  const totalProgressWidth = (progress.duration ? progress.currentTime / progress.duration : 0) * waveWidth
  const elementIsInView = useInView(elementRef, { amount: 0.5 })
  const activeCommentIndex = useCommentStore((state) => state.activeCommentIndex)
  const shouldPlay = activeCommentIndex === commentShareString && elementIsInView

  const pipeHeights = useMemo(() => {
    return Array(500)
      .fill(0)
      .map(() => Math.min(0.7, Math.max(Math.random(), 0.2)))
  }, []).slice(0, Math.floor(waveWidth / (gapWidth + pipeWidth)))

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    if (shouldPlay) {
      void element.play()
    } else {
      element.pause()
    }
  }, [shouldPlay])

  useEffect(() => {
    if (!elementRef.current || !btnRef.current) return
    const _netWidth = getComputedStyle(elementRef.current).width
    const _btnWidth = getComputedStyle(btnRef.current).width
    const netWidth = +_netWidth.substring(0, _netWidth.length - 2)
    const btnWidth = +_btnWidth.substring(0, _btnWidth.length - 2)
    const width = netWidth - 8 - btnWidth - 30
    setWaveWidth(width)
  }, [])

  return (
    <div className="w-full pr-6">
      <div ref={elementRef} className="flex w-full rounded-xl border-2 border-monochrome-9 p-2">
        <button ref={btnRef} style={{ marginRight: '16px' }} onClick={onClick}>
          <Image
            style={{ minHeight: '15px', minWidth: '15px' }}
            src={!shouldPlay ? audioCommentPlay : audioCommentPause}
            alt="volume-control"
          />
        </button>
        <audio
          onTimeUpdate={(e) => {
            setProgress((x) => {
              x.currentTime = audioRef.current?.currentTime ?? 0
              x.duration = audioRef.current?.duration ?? 0
              return { ...x }
            })
          }}
          style={{ position: 'absolute', zIndex: -1 }}
          ref={audioRef}
          src={url}
        />
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
