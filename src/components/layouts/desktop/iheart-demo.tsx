'use client'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { cn } from '@/lib/utils'
import { type ComponentProps, useEffect, useRef, useCallback } from 'react'
import { useState } from 'react'
import { Loader } from '@/components/ui/loader'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

export function IHeartDemo() {
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  if (!shouldShowIHeartDemo) return

  return <AudioPlayer />
}

type AudioPlayerPropsType = ComponentProps<'audio'>

function AudioPlayer({ ...restProps }: AudioPlayerPropsType) {
  const ihrIframeRef = useRef<any>(null)
  const ihrPlayerRef = useRef<any>(null)
  const { audioStateRef, isProgrammatic } = useIHeartDemoStates()
  const isMobile = useGenuinOptions().isMobile
  const { muted, toggleMuted, setShouldPlay } = usePlayerControlStore()
  const [shouldPlay] = useState(audioStateRef.current.shouldPlay)
  const { shouldPlay: playerShouldPlay } = usePlayerControlStore()
  const [isReady, setIsReady] = useState(false)

  const play = useCallback(() => {
    if (!isReady) return
    const audioElement = ihrPlayerRef.current
    console.log('in play callback')
    if (!muted) toggleMuted()
    isProgrammatic.current.play = true
    isProgrammatic.current.pause = false
    audioElement.play()
  }, [muted, isReady])

  const pause = useCallback(() => {
    console.log('in pause')
    if (!isReady) return
    const audioElement = ihrPlayerRef.current
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

  // useEffect(() => {
  //   console.log('DOM is fully loaded.')
  //   if (ihrPlayerRef.current) return
  //   if (ihrIframeRef.current) {
  //     iframeClick()
  //   }
  // }, [])

  useEffect(() => {
    console.log('DOM is fully loaded.')
    if (ihrPlayerRef.current) return
    const script = document.createElement('script')
    script.src = 'https://cdn.embed.ly/player-0.1.0.min.js'
    script.onload = () => {
      console.log('Script loaded successfully.')
      if (ihrIframeRef.current) {
        iframeClick()
      }
    }
    script.onerror = () => {
      console.error('Failed to load the script.')
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  function iframeClick() {
    if (ihrPlayerRef.current) return
    console.log('Iframe loaded.')
    // @ts-expect-error playerjs is not defined
    // eslint-disable-next-line no-undef
    ihrPlayerRef.current = new playerjs.Player(ihrIframeRef.current, { debug: true, autoplay: 1 }) // Enable debug mode

    console.log('Player initialized with debug mode enabled.')

    // Listen for the 'ready' event
    ihrPlayerRef.current.on('ready', function (e: any) {
      console.log('Player is ready!') // Log a message to the console
      ihrPlayerRef.current.ready(e)
      setIsReady(true)
      // Listen for other player events (optional, for debugging)
      ihrPlayerRef.current.on('play', function () {
        console.log('Player is playing.')
        isProgrammatic.current.play = false
        isProgrammatic.current.pause = false
        setShouldPlay(!!muted)
      })

      ihrPlayerRef.current.on('pause', function () {
        console.log('Player is paused.')
        isProgrammatic.current.play = false
        isProgrammatic.current.pause = false
        setShouldPlay(true)
      })

      ihrPlayerRef.current.on('error', function (error: any) {
        console.error('Player error:', error)
      })
    })
  }

  return (
    <>
      <section
        id={'playerjs-container'}
        className={cn(
          'animated-border relative m-auto flex w-full items-center justify-between overflow-clip 2xl:container 2xl:px-0',
          { 'border-b-4': isProgrammatic.current.play && !isMobile },
          { 'border-4 ': isProgrammatic.current.play && isMobile }
        )}
        style={{ height: '75px' }}>
        {!isReady && (
          <div className="text-black pointer-events-none absolute z-10 flex h-full w-full items-center justify-center bg-background">
            <Loader size="lg" />
          </div>
        )}
        <iframe
          src="https://www.iheart.com/live/z100-1469/?embed=true&pname=begeniun&autoplay=1"
          height="100%"
          width="100%"
          id="playerjs-iframe"
          ref={ihrIframeRef}
          allow="autoplay"
          // sandbox="allow-scripts allow-same-origin"
          className="relative z-0"
        />

        {isProgrammatic.current.play && !isMobile && (
          <iframe
            src="https://lottie.host/embed/47b0df3e-5d35-4c1e-859a-778acb4749df/gJ2SwN2VDX.lottie"
            className="absolute right-16 h-8 w-8"></iframe>
        )}
      </section>
    </>
  )
}
