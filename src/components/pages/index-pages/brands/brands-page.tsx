'use client'

import { GeneralShell, GeneralShellForInitialComponent, getAnimationUrl } from '../animated-tile'
import { RootShell } from '../root-shell'
import bgGenuinLogo from '@images/home/backgrounds/logos/brandsBgLogo.svg'
import { Button } from '@/components/ui/button'
import { Footer } from '../footer'
import { TickerCarousel } from '../ticker-carousel'
import { ArrowRight } from 'lucide-react'
import { AnimatedButton } from '../animated-component'
import Link from 'next/link'
import { BCC_LOGIN_LINK } from '@/lib/constants'

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
    videoLink: getAnimationUrl('unlockArt'),
  },
  {
    title: (
      <>
        <span className="text-light-blue">Entice</span>
        <br /> consumers with content
      </>
    ),
    subtitle: 'Incentivize consumers who share a passion for your brand to become advocates via engaging experiences.',
    videoLink: getAnimationUrl('enticeArt'),
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
    videoLink: getAnimationUrl('discoverArt'),
  },
]

export function BrandsPage() {
  return (
    <RootShell
      bgGrad="linear-gradient(180deg, rgba(22, 133, 253, 0.00)0%, rgba(22, 133, 253, 0.15)100%)"
      genuinLogo={bgGenuinLogo}
      initialComponent={<InitialComponent />}
      ctaForMobile={
        <Link href={BCC_LOGIN_LINK}>
          <AnimatedButton className="border bg-monochrome-white" shadowColor="#0645FF">
            <p className="whitespace-nowrap">Get Started</p>
            <ArrowRight />
          </AnimatedButton>
        </Link>
      }>
      <TickerCarousel />
      {listOfComps.map((comp, index) => {
        return (
          <GeneralShell key={index} animationUrl={comp.videoLink} subtitle={comp.subtitle} titleNode={comp.title} />
        )
      })}
      <BottomComponent />
      <Footer />
    </RootShell>
  )
}

function InitialComponent() {
  return (
    <GeneralShellForInitialComponent
      titleNode={
        <>
          <span className="text-light-blue">Reach</span>
          <br /> Reimagined.
        </>
      }
      subtitle="Connect with your audience to drive more conversion with video-based communities across owned & partners’
          media channels."
      cta={
        <Link href={BCC_LOGIN_LINK}>
          <AnimatedButton className="bg-primary" shadowColor="#1685FD">
            <p className="whitespace-nowrap pr-2 text-monochrome-white">Get started</p>
            <ArrowRight className="stroke-monochrome-white" />
          </AnimatedButton>
        </Link>
      }
    />
  )
}

function BottomComponent() {
  return (
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
  )
}
