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
// import { Button } from '@/components/ui/button'
import { AnimatedButton } from '../animated-component'
import { ArrowRight } from 'lucide-react'

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
        <br /> community with
        <br /> partner content
      </>
    ),
    subtitle:
      'Leverage GenuAI to ignite, manage, and grow your community with content from partners, advertisers, and creators.',
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
      'Whether your goal is to keep visitors within your ecosystem or support  partners, monetize vertical video inventory to increase time spent across your digital properties and LTV.',
    videoLink: getAnimationUrl('boostArt'),
  },
]

export function HomeComponent() {
  return (
    <RootShell
      bgGrad="linear-gradient(180deg, rgba(208, 220, 255, 0.00)0%, rgba(208, 220, 255, 0.60)100%)"
      genuinLogo={genuinLogo}
      initialComponent={<InitialComponent />}
      ctaForMobile={
        <ContactUs>
          <AnimatedButton className="border bg-monochrome-white" shadowColor="#0645FF">
            <p className="whitespace-nowrap">Book a demo</p>
            <ArrowRight />
          </AnimatedButton>
        </ContactUs>
      }>
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
      subtitle="Create video-based communities for Retail Media and Commerce Media to drive engagement and new revenue."
      cta={
        <ContactUs>
          <AnimatedButton className="bg-primary" shadowColor="#9395FF">
            <p className="whitespace-nowrap pr-2 text-monochrome-white">Book a demo</p>
            <ArrowRight className="stroke-monochrome-white" />
          </AnimatedButton>
        </ContactUs>
      }
      videoSrc="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
    />
  )
}

export function BookDemo() {
  return (
    <div className="container px-5 py-10 sm:px-10" style={{ maxWidth: 1200 }}>
      <div
        className="flex flex-col items-center gap-6 px-6 py-12 sm:gap-9 sm:px-20 md:py-16"
        style={{ background: 'linear-gradient(90deg, #9395FF, #1685FD)', borderRadius: 36 }}>
        <p className="text-center text-heading-3 font-bold text-monochrome-white md:text-title-1-bold-home-m">
          Book a demo with Genuin!
        </p>
        <p className="text-center text-cap-1-home leading-normal text-monochrome-white md:text-body-2-demi-home">
          Request our quick-start demo and learn about increasing customer engagement with your new Community Media
          Network to boost your media revenue.
        </p>
        <span className="hidden md:block">
          <ContactUs>
            <AnimatedButton className="bg-monochrome-white" shadowColor="#0645FF">
              <p className="whitespace-nowrap pr-2">Book a demo</p>
              <ArrowRight />
            </AnimatedButton>
          </ContactUs>
        </span>
      </div>
    </div>
  )
}
