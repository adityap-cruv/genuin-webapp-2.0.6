'use client'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { type ComponentProps, useCallback, useEffect, useRef } from 'react'
import { useState } from 'react'

const DATA: Record<string, { title: string; subtitle: string; src: string; image: string; id: string }> = {
  '1429': {
    title: 'Las Culturistas with Matt Rogers and Bowen Yang',
    subtitle: "I've… Been Through (w/ Ariana Grande) | Las Culturistas with Matt Rogers and Bowen Yang",
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image: 'https://media.begenuin.com/iheart_demo/iheart.webp',
    id: '7',
  },
  'ag-2cjy': {
    title: 'Good Morning with Susan Leigh Taylor',
    subtitle: '#1 Hit Music Station',
    src: 'https://media.begenuin.com/iheart_demo/z100.mp3',
    image: 'https://media.begenuin.com/iheart_demo/z100.webp',
    id: '8',
  },

  '1729': {
    title: 'Las Culturistas with Matt Rogers and Bowen Yang',
    subtitle: "I've… Been Through (w/ Ariana Grande) | Las Culturistas with Matt Rogers and Bowen Yang",
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image: 'https://media.begenuin.com/iheart_demo/iheart.webp',
    id: '1',
  },
  iheartmedia: {
    title: 'Las Culturistas with Matt Rogers and Bowen Yang',
    subtitle: "I've… Been Through (w/ Ariana Grande) | Las Culturistas with Matt Rogers and Bowen Yang",
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image: 'https://media.begenuin.com/iheart_demo/iheart.webp',
    id: '2',
  },

  '1775': {
    title: 'Good Morning with Susan Leigh Taylor',
    subtitle: '#1 Hit Music Station',
    src: 'https://media.begenuin.com/iheart_demo/z100.mp3',
    image: 'https://media.begenuin.com/iheart_demo/z100.webp',
    id: '3',
  },
  'z-100': {
    title: 'Good Morning with Susan Leigh Taylor',
    subtitle: '#1 Hit Music Station',
    src: 'https://media.begenuin.com/iheart_demo/z100.mp3',
    image: 'https://media.begenuin.com/iheart_demo/z100.webp',
    id: '4',
  },

  '2236': {
    title: 'Elvis Duran Presents: The 15 Minute Morning Show',
    subtitle: 'Would We Turn In The NYC Assassin If We Saw Him',
    src: 'https://media.begenuin.com/iheart_demo/elvis.mp3',
    image: 'https://media.begenuin.com/iheart_demo/elvis.webp',
    id: '5',
  },

  'elvis-duran': {
    title: 'Elvis Duran Presents: The 15 Minute Morning Show',
    subtitle: 'Would We Turn In The NYC Assassin If We Saw Him',
    src: 'https://media.begenuin.com/iheart_demo/elvis.mp3',
    image: 'https://media.begenuin.com/iheart_demo/elvis.webp',
    id: '6',
  },
}
export function IHeartDemo() {
  const pathName = usePathname()
  const { shouldShowIHeartDemo, brandId } = useIHeartDemoStates()
  const [key, setKey] = useState(brandId)

  useEffect(() => {
    const splitArr = pathName.split('/')
    const brandSlug = splitArr[1] === 'brand' ? splitArr[2] : null
    if (brandSlug && DATA[brandSlug]) {
      setKey(brandSlug)
    } else {
      setKey(brandId)
    }
  }, [brandId, pathName])

  if (!shouldShowIHeartDemo) return

  return (
    <AudioPlayer src={DATA[key].src} title={DATA[key].title} image={DATA[key].image} subtitle={DATA[key].subtitle} />
  )
}

type AudioPlayerPropsType = ComponentProps<'audio'> & {
  src: string
  startTime?: number
  shouldPlay?: boolean
  title: string
  subtitle: string
  image: string
}

function AudioPlayer({
  id,
  className,
  style,
  src,
  title,
  subtitle,
  image,
  startTime = 0,
  ...restProps
}: AudioPlayerPropsType) {
  const { audioStateRef } = useIHeartDemoStates()
  const { muted, mute, toggleMuted } = usePlayerControlStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [shouldPlay, setShouldPlay] = useState(audioStateRef.current.shouldPlay)
  const [isPlaying, setIsPlaying] = useState(false)
  const { shouldPlay: playerShouldPlay } = usePlayerControlStore()
  const pathName = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    element.currentTime = startTime
  }, [startTime])

  const play = useCallback(() => {
    const audioElement = audioRef.current
    if (!audioElement) return
    if (!muted) toggleMuted()
    void audioElement.play()
  }, [muted])

  const pause = useCallback(() => {
    const audioElement = audioRef.current
    if (!audioElement) return
    audioElement.pause()
  }, [])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return
    mute()
    if (audioElement.paused) void audioElement.play()
  }, [pathName, searchParams])

  useEffect(() => {
    if (!playerShouldPlay) play()
  }, [playerShouldPlay])

  useEffect(() => {
    if (shouldPlay && muted) {
      play()
    } else {
      pause()
    }
  }, [shouldPlay, muted])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return
    if (shouldPlay || muted) play()
    audioElement.currentTime = audioStateRef.current.currentTime

    function handleTimeUpdate(e: Event) {
      const target = e.target as HTMLAudioElement
      audioStateRef.current.currentTime = target.currentTime
    }

    function handleDuration(e: Event) {
      const target = e.target as HTMLAudioElement
      audioStateRef.current.duration = target.duration
    }

    function handlePlay() {
      setIsPlaying(true)
    }

    function handlePause() {
      setIsPlaying(false)
    }

    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('durationchange', handleDuration)
    audioElement.addEventListener('play', handlePlay)
    audioElement.addEventListener('pause', handlePause)
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('durationchange', handleDuration)
      audioElement.removeEventListener('play', handlePlay)
      audioElement.removeEventListener('pause', handlePause)
      // audioStateRef.current.currentTime = 0
      // audioStateRef.current.duration = 0
    }
  }, [src])

  const handleAudioClick = useCallback(() => {
    if (!muted) toggleMuted()
    setShouldPlay((prev) => {
      audioStateRef.current.shouldPlay = !prev
      return !prev
    })
  }, [muted])

  return (
    <section
      id={id}
      className={cn(
        'm-auto flex w-full items-center justify-between overflow-clip border-t border-new-off-black/40 px-4 2xl:container',
        className
      )}
      style={{ height: '80px', ...style }}>
      <div className="flex gap-4">
        <audio loop ref={audioRef} src={src} {...restProps} />
        <Button variant="custom" className="h-10 w-10 rounded-full bg-new-off-black" onClick={handleAudioClick}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <div>
          <p className="font-normal text-new-off-black" style={{ fontSize: '14px' }}>
            {subtitle}
          </p>
          <p className="text-cap-1-bold-home text-new-off-black">{title}</p>
        </div>
      </div>
      <img src={image} alt="audio-image" width="40" height="40" className="rounded-md" />
    </section>
  )
}

type IconProps = ComponentProps<'svg'>
function PlayIcon({ ...restProps }: IconProps) {
  return (
    <svg
      fill="white"
      height="12"
      viewBox="0 0 19 22"
      width="19"
      xmlns="http://www.w3.org/2000/svg"
      x="29%"
      y="35%"
      {...restProps}>
      <path d="M.94 1.859V20.14a1.761 1.761 0 0 0 2.718 1.483l14.365-9.142c1.094-.688 1.094-2.276 0-2.982L3.658.376A1.761 1.761 0 0 0 .94 1.86z"></path>
    </svg>
  )
}

function PauseIcon({ ...restProps }: IconProps) {
  return (
    <svg
      fill="white"
      height="12"
      viewBox="396 908 100 100"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
      x="24%"
      y="36%">
      <path d="M489.5,1004.9h-87.1c-1.9,0-3.4-1.5-3.4-3.4v-87.1c0-1.9,1.5-3.4,3.4-3.4h87.1c1.9,0,3.4,1.5,3.4,3.4v87.1 C492.9,1003.4,491.4,1004.9,489.5,1004.9z"></path>
    </svg>
  )
}
