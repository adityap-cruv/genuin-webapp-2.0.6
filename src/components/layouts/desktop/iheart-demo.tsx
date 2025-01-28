'use client'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { cn } from '@/lib/utils'
import { type ComponentProps, useEffect, useRef, useCallback } from 'react'
import { useState } from 'react'
import { Loader } from '@/components/ui/loader'

export function IHeartDemo() {
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  if (!shouldShowIHeartDemo) return

  return <AudioPlayer />
}

type AudioPlayerPropsType = ComponentProps<'audio'>

function AudioPlayer({ ...restProps }: AudioPlayerPropsType) {
  const ihsPlayerRef = useRef<any>(null)
  const { audioStateRef } = useIHeartDemoStates()
  const { muted, toggleMuted, setShouldPlay } = usePlayerControlStore()
  const [shouldPlay] = useState(audioStateRef.current.shouldPlay)
  const { shouldPlay: playerShouldPlay } = usePlayerControlStore()
  const [isReady, setIsReady] = useState(false)
  const isProgrammatic = useRef({ play: false, pause: false })

  const play = useCallback(() => {
    if (!isReady) return
    const audioElement = ihsPlayerRef.current
    console.log('in play callback')
    if (!muted) toggleMuted()
    isProgrammatic.current.play = true
    isProgrammatic.current.pause = false
    audioElement.play()
  }, [muted, isReady])

  const pause = useCallback(() => {
    console.log('in pause')
    if (!isReady) return
    const audioElement = ihsPlayerRef.current
    console.log('in pause callback')
    isProgrammatic.current.play = false
    isProgrammatic.current.pause = true
    audioElement.pause()
  }, [isReady])

  useEffect(() => {
    // console.log('playerShouldPlay:', playerShouldPlay)
    if (!isReady) return
    // if (!isProgrammatic.current.play) return
    if (!playerShouldPlay) play()
  }, [playerShouldPlay])

  useEffect(() => {
    console.log('shouldPlay:', shouldPlay)
    console.log('muted:', muted)
    if (!isReady) return
    if (shouldPlay && muted) {
      // if (!isProgrammatic.current.play) return
      play()
    } else {
      // if (!isProgrammatic.current.pause) return
      pause()
    }
  }, [shouldPlay, muted])

  useEffect(() => {
    console.log('DOM is fully loaded.')
    if (ihsPlayerRef.current) return
    const playerElement = document.getElementById('playerjs-iframe')
    if (playerElement) {
      iframeClick()
    }
  }, [])

  function iframeClick() {
    if (ihsPlayerRef.current) return
    const playerElement = document.getElementById('playerjs-iframe')
    console.log('Iframe loaded.')
    // @ts-expect-error playerjs is not defined
    // eslint-disable-next-line no-undef
    ihsPlayerRef.current = new playerjs.Player(playerElement, { debug: true }) // Enable debug mode

    console.log('Player initialized with debug mode enabled.')

    // Listen for the 'ready' event
    ihsPlayerRef.current.on('ready', function (e: any) {
      console.log('Player is ready!') // Log a message to the console
      ihsPlayerRef.current.ready(e)
      setIsReady(true)
      // Listen for other player events (optional, for debugging)
      ihsPlayerRef.current.on('play', function () {
        console.log('Player is playing.')
        isProgrammatic.current.play = false
        isProgrammatic.current.pause = false
        setShouldPlay(false)
      })

      ihsPlayerRef.current.on('pause', function () {
        console.log('Player is paused.')
        isProgrammatic.current.play = false
        isProgrammatic.current.pause = false
        setShouldPlay(true)
      })

      ihsPlayerRef.current.on('error', function (error: any) {
        console.error('Player error:', error)
      })
    })
  }

  return (
    <>
      <script src="https://cdn.embed.ly/player-0.1.0.min.js"></script>
      <section
        id={'playerjs-container'}
        className={cn(
          'relative m-auto flex w-full items-center justify-between overflow-clip border-new-off-black/40 2xl:container 2xl:px-0'
        )}
        style={{ height: '80px' }}>
        {!isReady && (
          <div className="text-black pointer-events-none absolute z-10 flex h-full w-full items-center justify-center bg-background">
            <Loader size="lg" />
          </div>
        )}
        <iframe
          src="https://www.iheart.com/live/z100-1469/?embed=true&pname=begeniun"
          height="100%"
          width="100%"
          id="playerjs-iframe"
          allow="autoplay"
          // sandbox="allow-scripts allow-same-origin"
          className="relative z-0"
          // onClick={() => {
          //   iframeClick()
          // }}
        />
      </section>
    </>
  )
}
