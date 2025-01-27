'use client'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { cn } from '@/lib/utils'
import { type ComponentProps, useEffect, useRef } from 'react'
import { useState } from 'react'

export function IHeartDemo() {
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  if (!shouldShowIHeartDemo) return

  return <AudioPlayer />
}

type AudioPlayerPropsType = ComponentProps<'audio'>

function AudioPlayer({ ...restProps }: AudioPlayerPropsType) {
  const ihsPlayerRef = useRef<any>(null)
  const { audioStateRef } = useIHeartDemoStates()
  const { muted } = usePlayerControlStore()
  const [shouldPlay] = useState(audioStateRef.current.shouldPlay)
  const [isPlaying] = useState(false)
  const { shouldPlay: playerShouldPlay } = usePlayerControlStore()

  useEffect(() => {
    console.log('playerShouldPlay:', playerShouldPlay)
    if (!ihsPlayerRef.current?.play) return
    if (!playerShouldPlay) ihsPlayerRef.current.play()
  }, [playerShouldPlay])

  useEffect(() => {
    console.log('shouldPlay:', shouldPlay)
    console.log('muted:', muted)
    if (ihsPlayerRef.current?.play) {
      if (shouldPlay && muted) {
        ihsPlayerRef.current.play()
      } else {
        ihsPlayerRef.current.pause()
      }
    }
  }, [shouldPlay, muted])

  useEffect(() => {
    console.log('isPlaying:', isPlaying)
  }, [isPlaying])

  useEffect(() => {
    console.log('DOM is fully loaded.')
    if (document.getElementById('playerjs-iframe')) return
    // Create the iframe element dynamically
    const iframe = document.createElement('iframe')
    iframe.id = 'playerjs-iframe'
    iframe.src = 'https://www.iheart.com/live/z100-1469/?embed=true&pname=begeniun'
    iframe.style.height = '100%'
    iframe.style.width = '100%'
    // iframe.src = 'https://z100.iheart.com/api/v4/player/live/1469/?sc=inferno&pname=WHTZ-FM&theme=light&ihrnetwork=true&embed=true'
    iframe.setAttribute('allow', 'autoplay') // Allow autoplay if needed
    iframe.setAttribute('allow-same-origin', 'true')
    iframe.setAttribute('allow-scripts', 'true')
    console.log('Iframe created with src:', iframe.src)

    // Append the iframe to the container
    const playerContainer = document.getElementById('playerjs-container')
    if (playerContainer) {
      playerContainer.appendChild(iframe)
      console.log('Iframe appended to the player container.')
    } else {
      console.error('Player container not found.')
    }
    const playerElement = document.getElementById('playerjs-iframe')
    if (playerElement) {
      console.log('Player element found.')
      playerElement.addEventListener('load', function (e) {
        console.log('Iframe loaded.')
        // Initialize the player on the dynamically created iframe
        // playerjs.DEBUG = true; // Enable debug mode
        // @ts-expect-error playerjs is not defined
        // eslint-disable-next-line no-undef
        ihsPlayerRef.current = new playerjs.Player(playerElement, { debug: true }) // Enable debug mode

        console.log('Player initialized with debug mode enabled.')

        // Listen for the 'ready' event
        ihsPlayerRef.current.on('ready', function (e: any) {
          console.log('Player is ready!') // Log a message to the console
          ihsPlayerRef.current.ready(e)
          ihsPlayerRef.current.isReady = true
          // Listen for other player events (optional, for debugging)
          ihsPlayerRef.current.on('play', function () {
            console.log('Player is playing.')
          })

          ihsPlayerRef.current.on('pause', function () {
            console.log('Player is paused.')
          })

          ihsPlayerRef.current.on('error', function (error: any) {
            console.error('Player error:', error)
          })
        })
      })
    } else {
      console.log('Player element not found.')
    }
  }, [])

  return (
    <>
      <script src="https://cdn.embed.ly/player-0.1.0.min.js"></script>
      <section
        id={'playerjs-container'}
        className={cn(
          'm-auto flex w-full items-center justify-between overflow-clip border-t border-new-off-black/40 2xl:container'
        )}
        style={{ height: '80px' }}></section>
    </>
  )
}
