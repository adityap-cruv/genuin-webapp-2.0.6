'use client'
// import { HomeNavBar } from './home-nav'
// import bg from '@images/home/index-bg.svg'
// import buildArt from '@images/home/build-art.png'
// import icCommunity from '@images/home/icon-community.svg'
// import icGraph from '@images/home/icon-graph.svg'
// import icVideo from '@images/home/icon-video.svg'
// import { Button } from '@components/ui/button'
import { Footer } from '../footer'
import { TickerCarousel } from '../ticker-carousel'
// import { BookDemo } from './book-demo'
// import { CustomAnimatedLogos, CustomAnimatedSection } from './animations'
// import { Tile } from './tile'
// import Graph from '@images/home/boost-graph.svg'
// import Mobile from '@images/home/boost-mobile.svg'
// import EngageArtBg from '@images/home/engage-art-bg.svg'
// import EAComment from '@images/home/EAComment.svg'
// import EAJoin from '@images/home/EAJoin.svg'
// import EAShare from '@images/home/EAShare.svg'
// import BAcommunityTab from '@images/home/BAcommunityTab.svg'
// import BAJoinCommunity from '@images/home/BAJoinCommunity.svg'
// import { ContactUs } from '@components/common/modals/contact-us'
import { RootShell } from '../root-shell'
import genuinLogo from '@images/home/backgrounds/logos/homeBgLogo.svg'
import { GeneralShell, getAnimationUrl, GeneralShellForInitialComponent } from '../animated-tile'
import { ContactUs } from '@/components/common/modals/contact-us'
import { Button } from '@/components/ui/button'

const listOfComps = [
  {
    title: (
      <>
        <span className="text-purple">Build </span>
        your <br />
        Community <br />
        Media Network
      </>
    ),
    subtitle:
      'Establish no-code, social communities with short videos that seamlessly integrate into your owned digital properties and beyond.',
    videoLink: getAnimationUrl('buildArt'),
  },
  {
    title: (
      <>
        <span className="text-purple">Engage </span>
        your
        <br /> consumers with
        <br /> partner content
      </>
    ),
    subtitle:
      'Populate with both brand and performance content from partners, advertisers, and creators to ignite your community. ',
    videoLink: getAnimationUrl('engageArt'),
  },
  {
    title: (
      <>
        <span className="text-purple">Activate</span> your
        <br /> marketing
        <br /> flywheel
      </>
    ),
    subtitle:
      'Launch, grow, manage, and market across all touchpoints. Recruit & retain community builders, integrate content, and optimize the entire experience.',
    videoLink: getAnimationUrl('flyWheelArt'),
  },
  {
    title: (
      <>
        <span className="text-purple">Boost </span>
        your
        <br /> incremental
        <br /> revenue
      </>
    ),
    subtitle:
      'Monetize new vertical video inventory to increase time spent on your owned and operated channels, conversion, and LTV.',
    videoLink: getAnimationUrl('boostArt'),
  },
]

export function HomeComponent() {
  return (
    <RootShell
      bgGrad="linear-gradient(180deg, rgba(208, 220, 255, 0.00)0%, rgba(208, 220, 255, 0.60)100%)"
      genuinLogo={genuinLogo}
      initialComponent={<InitialComponent />}>
      <TickerCarousel />
      {listOfComps.map((comp, index) => {
        return (
          <GeneralShell key={index} animationUrl={comp.videoLink} subtitle={comp.subtitle} titleNode={comp.title} />
        )
      })}
      <BookDemo />
      <Footer />
    </RootShell>
  )
}

export function InitialComponent() {
  return (
    <GeneralShellForInitialComponent
      titleNode={
        <>
          <span className="text-purple">Community</span> Reimagined.
        </>
      }
      subtitle="Create video-based communities within your retail media network to drive engagement and new revenue."
      cta={
        <ContactUs>
          <Button
            variant={'outline'}
            size={'custom'}
            className="rounded-[35px] px-9 py-5 text-body-2-bold-home hover:bg-home-black hover:text-monochrome-white">
            Book a demo
          </Button>
        </ContactUs>
      }
    />
  )
}

export function BookDemo() {
  return (
    <div className="container px-5 py-10 sm:px-10">
      <div
        className="flex flex-col gap-6 px-6 py-12 sm:gap-9 sm:px-20 md:py-16"
        style={{ background: 'linear-gradient(90deg, #9395FF, #1685FD)', borderRadius: 36 }}>
        <p className="text-center text-heading-3 font-bold text-monochrome-white md:text-title-1-bold-home-m">
          Book a demo with Genuin!
        </p>
        <p className="text-center text-cap-1-home leading-normal text-monochrome-white md:text-body-2-demi-home">
          Request our quick-start demo and learn about increasing customer engagement with your new Community Media
          Network to boost your media revenue.
        </p>
        <Button className="hidden md:block">Book a demo</Button>
      </div>
    </div>
  )
}
