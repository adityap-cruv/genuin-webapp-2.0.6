'use client'

import { AnimatedTile } from '../animated-tile'
import { RootShell } from '../root-shell'
import genuinLogo from '@images/home/backgrounds/logos/creatorsBgLogo.svg'
import { VanillaPlayer } from '@/components/common/vanilla-player'
import downloadQr from '@images/home/downloadAppQr.svg'
import Image from 'next/image'
import Link from 'next/link'
import playStoreImage from '@images/playStore.svg'
import appStoreImage from '@images/appStore.svg'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@/lib/constants'
import { Footer } from '../footer'
import { TickerCarousel } from '../../home/ticker-carousel'

const listOfComps = [
  {
    title: (
      <>
        <span className="text-blue">Partner </span>with <br />
        brands and retailers
      </>
    ),
    subtitle:
      'Integrate your content into communities run by brands and retailers that align with people who care about the same things you care about.',
    videoLink: 'https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8',
  },
  {
    title: (
      <>
        <span className="text-blue">Create</span>
        <br /> meaningful
        <br /> connections
      </>
    ),
    subtitle: 'Incentivize consumers who share a passion for your brand to become advocates via engaging experiences.',
    videoLink: 'https://media.begenuin.com/backend_assets/hero-video/comp-2_2.m3u8',
  },
  {
    title: (
      <>
        <span className="text-blue">Grow</span>your <br />
        community to <br />
        get rewards
      </>
    ),
    subtitle:
      'Connect your community to a network of retail media partners that can increase your brand’s reach and lead to new revenue.',
    videoLink: 'https://media.begenuin.com/backend_assets/hero-video/comp-3_2.m3u8',
  },
]

export function CreatorsPage() {
  return (
    <RootShell
      bgGrad="linear-gradient(180deg, rgba(147, 149, 255, 0.00)0%, rgba(147, 149, 255, 0.20)100%)"
      genuinLogo={genuinLogo}
      initialComponent={<InitialComponent />}>
      <TickerCarousel />
      {listOfComps.map((comp, index) => {
        return (
          <AnimatedTile key={index} className="py-9 md:py-14">
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="text-[36px] font-bold leading-none md:text-[56px]">{comp.title}</p>
              <p className="text-cap-1-bold-home font-medium md:text-title-1-med">{comp.subtitle}</p>
            </div>
            {/* <VanillaPlayer videoSource={comp.videoLink} /> */}
          </AnimatedTile>
        )
      })}
      <div className="container relative py-10 sm:px-10">
        <div
          className="flex flex-col gap-6 px-6 py-12 sm:gap-9 sm:px-20 md:w-4/5 md:py-16"
          style={{ background: 'linear-gradient(90deg, #9395FF, #1685FD)', borderRadius: 36 }}>
          <p className="w-full text-center text-heading-3 font-bold text-monochrome-white md:w-1/2 md:text-start md:text-title-1-bold-home-m">
            Start Your Community with Genuin!
          </p>
          <p className="w-full text-center text-cap-1-home leading-normal text-monochrome-white md:w-1/2 md:text-start md:text-body-2-demi-home">
            Launch your community in minutes and begin growing your distribution to reach highly-relevant consumers at
            scale.
          </p>
        </div>
        <div
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col items-center justify-center gap-4 bg-monochrome-white px-16 py-9 shadow-lg md:flex lg:-translate-x-1/3"
          style={{ borderRadius: 36 }}>
          <Image src={downloadQr} height={140} width={140} alt="Download" />
          <p className="text-center text-cap-1-bold-home font-extrabold leading-normal">
            Get the Genuin app to become a<br /> Community Builder
          </p>
          <div className="flex w-full items-center justify-center gap-4">
            <Link href={URL_TO_PLAY_STORE}>
              <Image src={playStoreImage} width={125} height={40} alt="play store" />
            </Link>
            <Link href={URL_TO_APP_STORE}>
              <Image src={appStoreImage} alt="app store" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </RootShell>
  )
}

function InitialComponent() {
  return (
    <AnimatedTile className="h-body">
      <div className="flex flex-col gap-4 transition-all md:flex-1 md:gap-9">
        <p className="text-center text-[44px] font-bold md:text-start md:text-[84px]" style={{ lineHeight: '100%' }}>
          <span className="text-blue">Connection</span>
          <br /> Reimagined.
        </p>
        <p className="text-center text-title-2-demi md:w-3/4 md:text-start md:text-body-2-home">
          Build communities around topics, interests, and brands you love, expand the reach of your content, and tap
          into a distribution network of video-based communities.
        </p>
        <div className="hidden w-3/4 max-w-md gap-4 bg-monochrome-white p-4 md:flex" style={{ borderRadius: '36px' }}>
          <Image src={downloadQr} height={120} width={120} alt="Download Genuin" />
          <div className="flex flex-col justify-center gap-4">
            <p className="text-cap-1-demi-home" style={{ fontWeight: 800 }}>
              Get the Genuin app to become a Community Builder
            </p>
            <div className="flex w-full gap-4">
              <Link href={URL_TO_PLAY_STORE}>
                <Image src={playStoreImage} width={125} height={40} alt="play store" />
              </Link>
              <Link href={URL_TO_APP_STORE}>
                <Image src={appStoreImage} alt="app store" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="aspect-reel h-full w-44 overflow-clip transition-all md:flex md:w-full md:flex-1 md:items-center md:justify-end">
        <VanillaPlayer
          className="h-full shrink-0 overflow-clip rounded-3xl border-[8px] border-monochrome-white md:rounded-[42px] md:border-[12px]"
          id="home-player"
          videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
          loop={true}
          poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
        />
      </div>
    </AnimatedTile>
  )
}
