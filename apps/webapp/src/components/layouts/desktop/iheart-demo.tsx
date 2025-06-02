'use client'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { cn } from '@/lib/utils'
import { PipIcon } from '@icons/pip-icon'
import React, { type ComponentProps, useEffect, useRef, useCallback } from 'react'
import { useState } from 'react'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { usePathname } from 'next/navigation'
import { useIheartBorderState } from '@/hooks/use-iheart-border'

/**
 * This const is defined for iheart only don't modify it.
 *
 */
export const STATIONS = [
  {
    name: 'Favorites',
    communities: [
      {
        name: 'Z100',
        slug: 'nyc-hit-music-station',
        audio: 'https://www.iheart.com/live/z100-1469/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/f082401c-d6e3-4b2b-8708-a7f111ee2d5d_1721930239902_1721930239902.png',
        brand: 'z-100',
      },
      {
        name: '93.9 FM WNYC',
        slug: '939-fm-wnyc',
        audio: 'https://www.iheart.com/live/939-fm-wnyc-5068/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1739852270823.png',
        brand: 'wnyc',
      },
      {
        name: 'Elvis Duran Show',
        slug: 'elvis-duran-show',
        audio:
          'https://www.iheart.com/podcast/1014-elvis-duran-and-the-morni-26935920/?embed=true&pname=begenuin&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/728865a3-6d08-47b1-9a90-4f4ae50a8926_1734008412984_1734008412985.png',
        brand: 'elvis-duran',
      },
    ],
  },
  {
    name: 'Recommended',
    communities: [
      {
        name: 'The Breakfast Club',
        slug: 'the-breakfast-club',
        audio: 'https://www.iheart.com/podcast/51-the-breakfast-club-24992238/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1740381379283.png',
        brand: 'breakfast-club',
      },
      {
        name: 'Power 105.1',
        slug: 'power-1051-fm',
        audio: 'https://www.iheart.com/live/power-1051-1481/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1740386971735.png',
        brand: 'power-1051-fm',
      },
      {
        name: 'Sabrina Carpenter',
        slug: 'sabrina-carpenter',
        audio: 'https://www.iheart.com/artist/sabrina-carpenter-553828/?embed=true&pname=begenuin&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1739855388191.png',
        brand: 'sabrina-carpenter',
      },
    ],
  },
  {
    name: 'Others',
    communities: [
      {
        name: 'Red, Right & Ready 🇺🇸',
        slug: 'red-right-ready',
        audio:
          'https://www.iheart.com/podcast/1119-the-clay-travis-and-buck-57927691/episode/hour-3-president-trump-calls-201512488/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/999e6734-2dd2-44c3-a4ee-6d9c3b4d43dd_20250302_105118.jpg',
        brand: 'clay-and-buck',
      },
      {
        name: 'Herd with Colin Cowherd',
        slug: 'herd-with-colin-cowherd',
        audio:
          'https://www.iheart.com/podcast/1-the-herd-with-colin-cowherd-27332740/episode/hour-3-michael-irvin-stops-257782152/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741451483787.png',
        brand: 'herd-with-colin-cowherd',
      },
      {
        name: 'Enrique Santos',
        slug: 'enrique-santos',
        audio:
          'https://www.iheart.com/podcast/1119-enrique-santos-podcast-60735270/episode/por-que-siempre-la-amante-es-257688982/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741452169258.png',
        brand: 'enrique-santos',
      },
      {
        name: 'Ryan Seacrest',
        slug: 'ryan-seacrest',
        audio:
          'https://www.iheart.com/podcast/51-on-air-with-ryan-seacrest-80159774/episode/full-show-the-new-years-resolution-255211383/?embed=true&pname=begeniun&autoplay=1',
        profileImage: 'https://media.begenuin.com/uploads/profile_images/s/brandProfileLogo_1741452427622.png',
        brand: 'ryan-seacrest',
      },
      {
        name: 'The Woody Show',
        slug: 'the-woody-show',
        audio:
          'https://www.iheart.com/podcast/684-the-woody-show-26318098/episode/full-show-pod-the-woody-show-257398130/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741453313040.png',
        brand: 'the-woody-show',
      },
      {
        name: 'Stuff You Should Know',
        slug: 'stuff-you-should-know',
        audio:
          'https://www.iheart.com/podcast/1119-stuff-you-should-know-26940277/episode/how-lsd-works-29467646/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741453920785.png',
        brand: 'stuff-you-should-know',
      },
      {
        name: 'The Happiness Lab',
        slug: 'the-happiness-lab',
        audio:
          'https://www.iheart.com/podcast/1297-the-happiness-lab-with-dr-47445035/episode/how-to-fight-perfectionism-182108110/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741454389681.png',
        brand: 'the-happiness-lab',
      },
      {
        name: 'Stuff To Blow Your Mind',
        slug: 'stuff-to-blow-your-mind',
        audio:
          'https://www.iheart.com/podcast/105-stuff-to-blow-your-mind-21123915/episode/weirdhouse-cinema-santo-vs-the-martian-256570042/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741454775849.png',
        brand: 'stuff-to-blow-your-mind',
      },
      {
        name: 'All The Smoke',
        slug: 'all-the-smoke',
        audio:
          'https://www.iheart.com/podcast/1119-all-the-smoke-51664494/episode/vice-president-kamala-harris-interview-221970816/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741458089492.png',
        brand: 'all-the-smoke',
      },
      {
        name: 'Las Culturistas',
        slug: 'las-culturistas',
        audio:
          'https://www.iheart.com/podcast/1119-las-culturistas-with-matt-31090140/episode/ive-been-through-w-ariana-grande-235445958/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741455436669.png',
        brand: 'las-culturistas',
      },
      {
        name: 'Ridiculous History',
        slug: 'ridiculous-history',
        audio:
          'https://www.iheart.com/podcast/105-ridiculous-history-28588696/episode/the-ridiculous-history-of-hot-sauce-154562470/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741455805084.png',
        brand: 'ridiculous-history',
      },
      {
        name: 'Nikki Glaser',
        slug: 'nikki-glaser',
        audio:
          'https://www.iheart.com/podcast/1119-the-nikki-glaser-podcast-79573913/episode/500-golden-globes-glow-up-nikki-glasers-255294659/?embed=true&pname=begeniun&autoplay=1',
        profileImage:
          'https://media.begenuin.com/uploads/profile_images/community/s/communityProfile_1741456167596.png',
        brand: 'nikki-glaser',
      },
    ],
  },
]

export function IHeartDemo({ inModal = false }: { inModal?: boolean }) {
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  if (!shouldShowIHeartDemo) return

  return <AudioPlayer inModal={inModal} />
}

type AudioPlayerPropsType = { inModal: boolean } & ComponentProps<'audio'>

// paths for each communities.
const communityPaths = STATIONS.flatMap((station) =>
  station.communities.map((community) => PATH_NAME.community(community.slug))
)

// audio urls for each communities. Here community index is used to get respective audio stream.
const audioUrls = STATIONS.flatMap((station) => station.communities.map((community) => community.audio))

// export function updateIHeartAudio(pathName: string) {
//   const { setAudioUrl } = useIHeartDemoStates()
//   const communityIndex = communityPaths.findIndex((path) => path === pathName)
//   if (communityIndex !== -1) {
//     setAudioUrl(audioUrls[communityIndex])
//   }
// }

function AudioPlayer({ inModal, ...restProps }: AudioPlayerPropsType) {
  const ihrIframeRef = useRef<HTMLIFrameElement>(null)
  const ihrPlayerRef = useRef<any>(null)
  const { audioStateRef, isIHeartPlaying, setIsIHeartPlaying, audioUrl } = useIHeartDemoStates()
  const isMobile = useGenuinOptions().isMobile
  const [shouldPlay] = useState(audioStateRef.current.shouldPlay)
  const { muted, toggleMuted, setShouldPlay, shouldPlay: playerShouldPlay, isFullScreen } = usePlayerControlStore()
  const isProgrammatic = useRef<{ play: boolean; pause: boolean }>({ play: false, pause: false })
  const [isReady, setIsReady] = useState(false)
  const [isPipOpen, setIsPipOpen] = useState(false)
  const showBorder = useIheartBorderState((isIHeartPlaying && isMobile) || (isIHeartPlaying && isFullScreen))
  const pathName = usePathname()

  useEffect(() => {
    // iframe element
    const iframe = ihrIframeRef.current
    if (!iframe) return
    // find communityIndex for which path is equal to pathName
    const communityIndex = communityPaths.findIndex((path) => path === pathName)
    // if communityIndex is found, set the src of iframe to audioUrls[communityIndex]
    if (communityIndex !== -1) {
      if (iframe.src !== audioUrls[communityIndex]) iframe.src = audioUrls[communityIndex]
    }
  }, [pathName])

  const play = useCallback(() => {
    if (!isReady) return
    const audioElement = ihrPlayerRef.current
    // we will not able to get videoId from useFeedListContext, in case of iheart demo, so we will use the videoId from the url
    if (!muted) toggleMuted()
    isProgrammatic.current.play = true
    isProgrammatic.current.pause = false
    audioElement.play()
    setIsIHeartPlaying(true)
  }, [muted, isReady])

  const pause = useCallback(() => {
    if (!isReady) return
    const audioElement = ihrPlayerRef.current
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
     
    ihrPlayerRef.current = new playerjs.Player(ihrIframeRef.current, { debug: true, autoplay: 1 }) // Enable debug mode

    console.log('Player initialized with debug mode enabled.')

    // Listen for the 'ready' event
    ihrPlayerRef.current.on('ready', function (e: any) {
      console.log('Player is ready!') // Log a message to the console
      ihrPlayerRef.current.ready(e)
      setIsReady(true)

      // Create an invisible button to simulate user interaction
      const btn = document.createElement('button')
      btn.style.position = 'absolute'
      btn.style.opacity = '0'
      btn.style.pointerEvents = 'none'
      document.body.appendChild(btn)

      // Click the button once
      btn.click()

      // Remove the button after click
      setTimeout(() => {
        if (btn && document.body.contains(btn)) {
          document.body.removeChild(btn)
        }
      }, 500)

      let attempts = 0
      const maxAttempts = 5

      const tryPlaying = () => {
        if (attempts >= maxAttempts || isIHeartPlaying) {
          console.warn('Stopping play attempts.')
          return
        }

        // console.log(`Attempt #${attempts + 1} to play the player.`)
        ihrPlayerRef.current.play()
        attempts++

        setTimeout(() => {
          if (!isIHeartPlaying) {
            tryPlaying() // Retry if player is not playing
          }
        }, 2000)
      }

      tryPlaying() // Start the first attempt

      ihrPlayerRef.current.on('play', function () {
        console.log('Player is playing.')
        isProgrammatic.current.play = false
        isProgrammatic.current.pause = false
        setShouldPlay(!!muted)
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
        // setIsIHeartPlaying(false)
      })
    })
  }

  return (
    <>
      <div
        id="playerjs-upper-container"
        style={{ height: 75 }}
        className={cn(
          'animated-border relative m-auto flex w-full items-center justify-between overflow-clip transition-all ease-in-out 2xl:container 2xl:px-0',
          {
            'border-b-4': isIHeartPlaying && !isMobile && !isPipOpen && isReady && !isFullScreen,
          }
        )}>
        <div
          className={cn('pointer-events-none absolute z-10 h-full w-full bg-transparent transition-all ease-in-out', {
            'animated-border border-4': (showBorder && isMobile && isReady) || (isFullScreen && showBorder),
            'border-4 border-transparent': !(showBorder && isMobile && isReady),
          })}
        />

        <section
          id="playerjs-container"
          className={cn(
            'relative m-auto flex w-full items-center justify-between gap-2 overflow-clip border-new-off-black/40 2xl:container 2xl:px-0'
          )}
          style={{ height: '75px' }}>
          <iframe
            src={audioUrl}
            height="100%"
            width="100%"
            id="playerjs-iframe"
            ref={ihrIframeRef}
            allow="autoplay"
            // sandbox="allow-scripts allow-same-origin"
            className="relative z-0"
          />
          {/* {isIHeartPlaying && !isPipOpen && (
            <iframe
              src="https://lottie.host/embed/47b0df3e-5d35-4c1e-859a-778acb4749df/gJ2SwN2VDX.lottie"
              className={`absolute  ${isMobile ? 'right-2.5 h-6 w-6' : 'right-28 h-8 w-8'}`}></iframe>
          )} */}
          {isIHeartPlaying && !isPipOpen && isReady && (
            <img
              src="https://media.begenuin.com/iheart_demo/equalizer.gif"
              alt="gif"
              style={{
                right: isMobile || inModal || isFullScreen ? '13px' : '56px',
              }}
              className={`absolute h-8 w-8`}
            />
          )}
          {!isPipOpen && !isMobile && !inModal && !isFullScreen && (
            <div onClick={handleOpenPipClick} className="cursor-pointer rounded-lg bg-tertiary-200 p-2">
              <PipIcon />
            </div>
          )}
        </section>
      </div>
    </>
  )
}
