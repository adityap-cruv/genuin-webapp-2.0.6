'use client'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { cn } from '@/lib/utils'
import { PipIcon } from '@icons/pip-icon'
import React, { type ComponentProps, useEffect, useRef, useCallback } from 'react'
import { useState } from 'react'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

export function IHeartDemo({ inModal = false }: { inModal?: boolean }) {
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  if (!shouldShowIHeartDemo) return

  return <AudioPlayer inModal={inModal} />
}

type AudioPlayerPropsType = { inModal: boolean } & ComponentProps<'audio'>

function AudioPlayer({ inModal, ...restProps }: AudioPlayerPropsType) {
  const ihrIframeRef = useRef<any>(null)
  const ihrPlayerRef = useRef<any>(null)
  const { audioStateRef, isIHeartPlaying, setIsIHeartPlaying } = useIHeartDemoStates()
  const isMobile = useGenuinOptions().isMobile
  const [shouldPlay] = useState(audioStateRef.current.shouldPlay)
  const { muted, toggleMuted, setShouldPlay, shouldPlay: playerShouldPlay } = usePlayerControlStore()
  const isProgrammatic = useRef<{ play: boolean; pause: boolean }>({ play: false, pause: false })
  const [isReady, setIsReady] = useState(false)
  const [isPipOpen, setIsPipOpen] = useState(false)

  const [showBorder, setShowBorder] = useState(false)
  useEffect(() => {
    if (isIHeartPlaying) {
      setShowBorder(true)

      setTimeout(() => {
        setShowBorder(false)
      }, 3000)
    } else {
      setShowBorder(false)
    }
  }, [isIHeartPlaying])

  const play = useCallback(() => {
    if (!isReady) return
    const audioElement = ihrPlayerRef.current
    console.log('in play callback')
    if (!muted) toggleMuted()
    isProgrammatic.current.play = true
    isProgrammatic.current.pause = false
    audioElement.play()
    setIsIHeartPlaying(true)
  }, [muted, isReady])

  const pause = useCallback(() => {
    console.log('in pause')
    if (!isReady) return
    const audioElement = ihrPlayerRef.current
    console.log('in pause callback')
    isProgrammatic.current.play = false
    isProgrammatic.current.pause = true
    audioElement.pause()
    setIsIHeartPlaying(false)
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

  const handleOpenPipClick = useCallback(async () => {
    if ('documentPictureInPicture' in window) {
      const container = document.getElementById('playerjs-upper-container')
      const player = document.getElementById('playerjs-container')
      // const element = document.getElementById('playerjs-iframe')
      if (!container || !player) return

      // Open a Picture-in-Picture window.
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        height: 428,
        width: 354,
      })
      setIsPipOpen(true)
      player.style.height = '428px'
      player.style.width = '350px'
      player.style.boxSizing = 'border-box'
      pipWindow.document.body.style.margin = '0px'
      pipWindow.document.body.style.overflow = 'clip'
      // pipWindow.style.padding = '0px'
      // Move the player to the Picture-in-Picture window.
      pipWindow.document.body.append(player)

      // Move the player back when the Picture-in-Picture window closes.
      pipWindow.addEventListener('pagehide', (event: any) => {
        const pipContainer = event.target.querySelector('#playerjs-container')
        pipContainer.style.height = '75px'
        pipContainer.style.width = '100%'
        setIsPipOpen(false)
        container.append(pipContainer)
      })
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
        setShouldPlay(false)
        setIsIHeartPlaying(true)
      })

      ihrPlayerRef.current.on('pause', function () {
        console.log('Player is paused.')
        isProgrammatic.current.play = false
        isProgrammatic.current.pause = false
        setShouldPlay(true)
        setIsIHeartPlaying(false)
      })

      ihrPlayerRef.current.on('error', function (error: any) {
        console.error('Player error:', error)
      })
    })
  }

  return (
    <>
      <script src="https://cdn.embed.ly/player-0.1.0.min.js"></script>
      <div
        id="playerjs-upper-container"
        style={{ height: 75 }}
        className={cn(
          'animated-border relative m-auto flex w-full items-center justify-between overflow-clip 2xl:container 2xl:px-0',
          { 'border-b-4': isIHeartPlaying && !isMobile && !isPipOpen },
          { 'border-4 ': showBorder && isMobile }
        )}>
        <section
          id="playerjs-container"
          className={cn(
            'relative m-auto flex w-full items-center justify-between gap-2 overflow-clip border-new-off-black/40 2xl:container 2xl:px-0'
          )}
          style={{ height: '75px' }}>
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
          {showBorder && (
            <iframe
              src="https://lottie.host/embed/47b0df3e-5d35-4c1e-859a-778acb4749df/gJ2SwN2VDX.lottie"
              className={`absolute  ${isMobile ? 'right-2.5 h-6 w-6' : 'right-28 h-8 w-8'}`}></iframe>
          )}
          {!isPipOpen && !isMobile && !inModal && (
            <div onClick={handleOpenPipClick} className="cursor-pointer rounded-lg bg-tertiary-200 p-2">
              <PipIcon />
            </div>
          )}
        </section>
      </div>
    </>
  )
}
