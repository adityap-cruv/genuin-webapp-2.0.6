'use client'
import { useCommentStore } from '@/components/common/comments/store'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { type ComponentProps, useCallback, useEffect, useRef } from 'react'
import { useState } from 'react'

const DATA: Record<string, { title: string; subtitle: string; src: string; image: string }> = {
  '1429': {
    title: 'El Paso',
    subtitle: 'Feat. Roger Miller, Patsy Cline, Jim Reeves and more',
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image:
      'https://i.iheart.com/v3/url/aHR0cCUzQSUyRiUyRmltYWdlLmloZWFydC5jb20lMkZTQk1HMiUyRlRodW1iX0NvbnRlbnQlMkZGdWxsX1BDJTJGU0JNRyUyRk5vdjA5JTJGMTExNzA5JTJGMTkwNzMwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjY4MSUyRjg0JTJGY2I0YzVlMWI0NDc3NjYyOTcxMjMyNzNkMmNlNjdjMDQuanBn?ops=fit(250%2C250)',
    // id: '1',
  },
  'ag-2cjy': {
    title: 'El Paso',
    subtitle: 'Feat. Roger Miller, Patsy Cline, Jim Reeves and more',
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image:
      'https://i.iheart.com/v3/url/aHR0cCUzQSUyRiUyRmltYWdlLmloZWFydC5jb20lMkZTQk1HMiUyRlRodW1iX0NvbnRlbnQlMkZGdWxsX1BDJTJGU0JNRyUyRk5vdjA5JTJGMTExNzA5JTJGMTkwNzMwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjY4MSUyRjg0JTJGY2I0YzVlMWI0NDc3NjYyOTcxMjMyNzNkMmNlNjdjMDQuanBn?ops=fit(250%2C250)',
    // id: '2',
  },

  '1729': {
    title: 'El Paso',
    subtitle: 'Feat. Roger Miller, Patsy Cline, Jim Reeves and more',
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image:
      'https://i.iheart.com/v3/url/aHR0cCUzQSUyRiUyRmltYWdlLmloZWFydC5jb20lMkZTQk1HMiUyRlRodW1iX0NvbnRlbnQlMkZGdWxsX1BDJTJGU0JNRyUyRk5vdjA5JTJGMTExNzA5JTJGMTkwNzMwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjY4MSUyRjg0JTJGY2I0YzVlMWI0NDc3NjYyOTcxMjMyNzNkMmNlNjdjMDQuanBn?ops=fit(250%2C250)',
    // id: '1',
  },
  iheartmedia: {
    title: 'El Paso',
    subtitle: 'Feat. Roger Miller, Patsy Cline, Jim Reeves and more',
    src: 'https://media.begenuin.com/iheart_demo/iheart.mp3',
    image:
      'https://i.iheart.com/v3/url/aHR0cCUzQSUyRiUyRmltYWdlLmloZWFydC5jb20lMkZTQk1HMiUyRlRodW1iX0NvbnRlbnQlMkZGdWxsX1BDJTJGU0JNRyUyRk5vdjA5JTJGMTExNzA5JTJGMTkwNzMwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjAwMCUyRjY4MSUyRjg0JTJGY2I0YzVlMWI0NDc3NjYyOTcxMjMyNzNkMmNlNjdjMDQuanBn?ops=fit(250%2C250)',
    // id: '2',
  },
  '1775': {
    title: 'Stargazing',
    subtitle: 'Feat. Benson Boone, Post Malone, Imagine Dragons and more',
    src: 'https://media.begenuin.com/iheart_demo/z100.mp3',
    image:
      'https://i.iheart.com/v3/url/aHR0cCUzQSUyRiUyRmltYWdlLmloZWFydC5jb20lMkZpaHItaW5nZXN0aW9uLXBpcGVsaW5lLXByb2R1Y3Rpb24tc2JtZyUyRkExMDMwMUEwMDA1MjgwOTg2V18yMDI0MDQxOTIzNDkyMzY2NyUyRjQ5YTgyOWVmZjU0NWMxOGUyNmE0MzE0ZWZmOWMwNDE0LjIwMTI2LmpwZw==?ops=fit(250%2C250)',
    // id: '3',
  },

  'z-100': {
    title: 'Stargazing',
    subtitle: 'Feat. Benson Boone, Post Malone, Imagine Dragons and more',
    src: 'https://media.begenuin.com/iheart_demo/z100.mp3',
    image:
      'https://i.iheart.com/v3/url/aHR0cCUzQSUyRiUyRmltYWdlLmloZWFydC5jb20lMkZpaHItaW5nZXN0aW9uLXBpcGVsaW5lLXByb2R1Y3Rpb24tc2JtZyUyRkExMDMwMUEwMDA1MjgwOTg2V18yMDI0MDQxOTIzNDkyMzY2NyUyRjQ5YTgyOWVmZjU0NWMxOGUyNmE0MzE0ZWZmOWMwNDE0LjIwMTI2LmpwZw==?ops=fit(250%2C250)',
    // id: '4',
  },

  '2236': {
    title: 'Elvis Duran Presents: The 15 Minute Morning Show',
    subtitle: 'Would We Turn In The NYC Assassin If We Saw Him?',
    src: 'https://media.begenuin.com/iheart_demo/elvis.mp3',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/83/d5/cd/83d5cd84-b5ef-0916-4e45-3227f56354a6/mza_8632338813335929889.jpg/1200x1200bf.webp',
    // id: '5',
  },

  'elvis-duran': {
    title: 'Elvis Duran Presents: The 15 Minute Morning Show',
    subtitle: 'Would We Turn In The NYC Assassin If We Saw Him?',
    src: 'https://media.begenuin.com/iheart_demo/elvis.mp3',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/83/d5/cd/83d5cd84-b5ef-0916-4e45-3227f56354a6/mza_8632338813335929889.jpg/1200x1200bf.webp',
    // id: '6',
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
  const { muted, shouldPlay: playerShouldPlay } = usePlayerControlStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [shouldPlay, setShouldPlay] = useState(audioStateRef.current.shouldPlay)
  const [isPlaying, setIsPlaying] = useState(false)
  const { setActiveCommentIndex } = useCommentStore()

  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    element.currentTime = startTime
  }, [startTime])

  const play = useCallback(
    (setActiveComment: boolean) => {
      const audioElement = audioRef.current
      if (!audioElement) return
      setActiveComment && setActiveCommentIndex('audio-playing')
      void audioElement.play()
    },
    [setActiveCommentIndex]
  )

  const pause = useCallback(
    (setActiveComment: boolean) => {
      const audioElement = audioRef.current
      if (!audioElement) return
      setActiveComment && setActiveCommentIndex('')
      audioElement.pause()
    },
    [setActiveCommentIndex]
  )

  useEffect(() => {
    if (shouldPlay) {
      play(!muted)
    } else {
      pause(!muted)
    }
  }, [shouldPlay, muted])

  useEffect(() => {
    if (!playerShouldPlay) {
      setShouldPlay(true)
    } else {
      setShouldPlay(false)
    }
  }, [playerShouldPlay])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return
    if (shouldPlay || muted) {
      play(!muted)
    }
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
    setShouldPlay((prev) => {
      audioStateRef.current.shouldPlay = !prev
      return !prev
    })
  }, [])

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
