'use client'

import { GeneralShell, GeneralShellForInitialComponent, getAnimationUrl } from '../animated-tile'
import { RootShell } from '../root-shell'
import genuinLogo from '@images/home/backgrounds/logos/creatorsBgLogo.svg'
import downloadQr from '@images/home/downloadAppQr.svg'
import Image from 'next/image'
import Link from 'next/link'
import playStoreImage from '@images/playStore.svg'
import appStoreImage from '@images/appStore.svg'
import { MOBILE_DOWNLOAD_APP_LINK, URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@/lib/constants'
import { Footer } from '../footer'
import { AnimatedButton } from '../animated-component'
import { ArrowRight } from 'lucide-react'
import CreatorsPoster from '@images/home/creators_poster.webp'

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
    videoLink: getAnimationUrl('partnerArt'),
  },
  {
    title: (
      <>
        <span className="text-blue">Create</span>
        <br /> meaningful
        <br /> connections
      </>
    ),
    subtitle: 'Interact with new people and curate a relevant, connected community that you own and manage.',
    videoLink: getAnimationUrl('createArt'),
  },
  {
    title: (
      <>
        <span className="text-blue">Grow </span>your
        <br />
        community to <br />
        get rewards
      </>
    ),
    subtitle:
      'Invite 100 new members across your network and brand partner communities. Then, earn a $100 payout when they sign up.',
    videoLink: getAnimationUrl('growArt'),
  },
]

export function CreatorsPage() {
  return (
    <RootShell
      bgGrad="linear-gradient(180deg, rgba(147, 149, 255, 0.00)0%, rgba(147, 149, 255, 0.20)100%)"
      genuinLogo={genuinLogo}
      initialComponent={<InitialComponent />}
      ctaForMobile={
        <Link href={MOBILE_DOWNLOAD_APP_LINK}>
          <AnimatedButton className="border bg-monochrome-white" shadowColor="#0645FF">
            <p className="whitespace-nowrap">Get Genuin</p>
            <ArrowRight />
          </AnimatedButton>
        </Link>
      }>
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
          <span className="text-blue">Connection</span>
          <br /> Reimagined.
        </>
      }
      subtitle="Build communities around topics, interests, and brands you love, expand the reach of your content, and tap
          into a distribution network of video-based communities."
      cta={
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
      }
      posterSrc={CreatorsPoster.src}
    />
  )
}

function BottomComponent() {
  return (
    <div className="container relative py-10 sm:px-10" style={{ maxWidth: 1200 }}>
      <div
        className="relative flex flex-col gap-6 px-6 py-12 sm:gap-9 sm:px-20 md:w-4/5 md:py-16"
        style={{ background: 'linear-gradient(90deg, #9395FF, #1685FD)', borderRadius: 36 }}>
        <p className="w-full text-center text-heading-3 font-bold text-monochrome-white md:w-3/4 md:text-start md:text-title-1-bold-home-m">
          Start Your Community with Genuin!
        </p>
        <p className="w-full text-center text-cap-1-home leading-normal text-monochrome-white md:w-3/4 md:text-start md:text-body-2-demi-home">
          Launch your community in minutes and begin growing your distribution to reach highly-relevant consumers at
          scale.
        </p>
        <div
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 flex-col items-center justify-center gap-4 bg-monochrome-white px-16 py-9 shadow-lg  md:flex"
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
    </div>
  )
}
