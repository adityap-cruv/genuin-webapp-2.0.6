'use client'

import { AnimatedTile } from '../animated-tile'
import { RootShell } from '../root-shell'
import bgGenuinLogo from '@images/home/backgrounds/logos/brandsBgLogo.svg'
import { Button } from '@/components/ui/button'
import { VanillaPlayer } from '@/components/common/vanilla-player'
import { Footer } from '../footer'
import { TickerCarousel } from '../../home/ticker-carousel'
// import { ArrowRight } from 'lucide-react'

const listOfComps = [
  {
    title: (
      <>
        <span className="text-light-blue">Unlock</span> <br />
        first-party data
      </>
    ),
    subtitle:
      'Launch your own community in minutes with AI-curated videos to access first-party data previously held captive in walled gardens.',
    videoLink: 'https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8',
  },
  {
    title: (
      <>
        <span className="text-light-blue">Entice</span>
        <br /> consumers with content
      </>
    ),
    subtitle: 'Incentivize consumers who share a passion for your brand to become advocates via engaging experiences.',
    videoLink: 'https://media.begenuin.com/backend_assets/hero-video/comp-2_2.m3u8',
  },
  {
    title: (
      <>
        <span className="text-light-blue">Discover</span> <br />
        new channels for distribution{' '}
      </>
    ),
    subtitle:
      'Connect your community to a network of retail media partners that can increase your brand’s reach and lead to new revenue.',
    videoLink: 'https://media.begenuin.com/backend_assets/hero-video/comp-3_2.m3u8',
  },
]
export function BrandsPage() {
  return (
    <RootShell
      bgGrad="linear-gradient(180deg, rgba(22, 133, 253, 0.00)0%, rgba(22, 133, 253, 0.15)100%)"
      genuinLogo={bgGenuinLogo}
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
      <div className="container px-5 py-10 sm:px-10">
        <div
          className="flex flex-col gap-6 px-6 py-12 sm:gap-9 sm:px-20 md:py-16"
          style={{ background: 'linear-gradient(90deg, #9395FF, #1685FD)', borderRadius: 36 }}>
          <p className="text-center text-heading-3 font-bold text-monochrome-white md:text-title-1-bold-home-m">
            Start Your Community with Genuin!
          </p>
          <p className="text-center text-cap-1-home leading-normal text-monochrome-white md:text-body-2-demi-home">
            Launch your brand community in minutes thanks to GenuAI and begin creating deeper connections that result in
            life-long consumers.
          </p>
          <Button className="hidden md:block">Get started</Button>
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
          <span className="text-light-blue">Reach</span>
          <br /> Reimagined.
        </p>
        <p className="text-center text-title-2-demi md:w-3/4 md:text-start md:text-body-2-home">
          Connect with your audience to drive more conversion with video-based communities across owned & partners’
          media channels.
        </p>
        {/* <Button
          variant="custom"
          className="flex w-min gap-2 rounded-full bg-blue px-6 py-3 text-cap-1-bold-home font-extrabold shadow-[8px_8px_0px_0px_#9395FF] transition duration-200 hover:border hover:border-home-black hover:shadow-none">
          <p className="whitespace-nowrap">Book a demo</p>
          <ArrowRight />
        </Button> */}
      </div>
      <div className="aspect-reel w-44 overflow-clip transition-all md:flex md:flex-1 md:items-center md:justify-end lg:h-full">
        <VanillaPlayer
          className="h-full shrink-0 overflow-clip rounded-3xl border-[8px] border-monochrome-white md:rounded-[42px] md:border-[12px] lg:h-5/6"
          id="home-player"
          videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
          loop={true}
          poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
        />
      </div>
    </AnimatedTile>
  )
}
