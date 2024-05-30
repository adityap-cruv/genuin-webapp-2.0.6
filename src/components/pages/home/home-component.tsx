'use client'
import { HomeNavBar } from './home-nav'
import bg from '@images/home/index-bg.png'
import boostArt from '@images/home/boost-art.png'
import buildArt from '@images/home/build-art.png'
import engageArt from '@images/home/engage-art.png'
import icCommunity from '@images/home/icon-community.svg'
import icGraph from '@images/home/icon-graph.svg'
import { Button } from '@components/ui/button'
import { HomeFooter } from './home-footer'
import { TickerCarousel } from './ticker-carousel'
import { PartnershipEcosystem } from './partnership-ecosystem'
import { BookDemo } from './book-demo'
import { CustomAnimatedLogos, CustomAnimatedSection } from './animations'
import { BuildEnagageBoost } from './build-engage-boost'
import { CommunityReimagined } from './community-reimagined'

const infoData = [
  {
    title: (
      <p className="text-title-2-bold-home-m text-center md:text-left md:text-title-2-bold-home">
        <span className="bg-gradient-to-r from-[#9395FF] to-[#1685FD] bg-clip-text text-transparent">Build </span>
        your Community Media Network
      </p>
    ),
    subtitle:
      'Establish no-code, social communities with short videos that seamlessly integrate into your owned digital properties and beyond.',
    imageSrc: buildArt.src,
  },
  {
    title: (
      <p className="text-title-2-bold-home-m text-center md:text-left md:text-title-2-bold-home">
        <span className="bg-gradient-to-r from-[#9395FF] to-[#1685FD] bg-clip-text text-transparent">Engage </span>
        your consumers with partner content
      </p>
    ),
    subtitle: 'Engage with your audience through interactive and engaging content tailored to their interests.',
    imageSrc: engageArt.src,
  },
  {
    title: (
      <p className="text-title-2-bold-home-m text-center md:text-left md:text-title-2-bold-home">
        <span className="bg-gradient-to-r from-[#9395FF] to-[#1685FD] bg-clip-text text-transparent">Boost </span>
        your incremental revenue
      </p>
    ),
    subtitle:
      'Discover new revenue streams by leveraging your content through strategic partnerships and sponsorships.',
    imageSrc: boostArt.src,
  },
]

export function HomeComponent() {
  return (
    <div className="font-manrope">
      <HomeNavBar />
      <div
        className="md:h-customscreen relative h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${bg.src})`,
        }}>
        <CustomAnimatedLogos classname="absolute md:block hidden left-[30%] top-[13%] z-0">
          <img src={icCommunity.src} alt="community" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos classname="absolute md:block -translate-x-28 translate-y-20  hidden left-[9%] top-[45%] z-0">
          <img src={icGraph.src} alt="graph" />
        </CustomAnimatedLogos>

        <CustomAnimatedSection classname="container z-10">
          <CommunityReimagined />
        </CustomAnimatedSection>
      </div>

      <CustomAnimatedSection>
        <TickerCarousel />
      </CustomAnimatedSection>

      {infoData.map((data, index) => (
        <CustomAnimatedSection key={index} classname="container">
          <BuildEnagageBoost title={data.title} subtitle={data.subtitle} imageSrc={data.imageSrc} />
        </CustomAnimatedSection>
      ))}

      <CustomAnimatedSection classname="container">
        <PartnershipEcosystem />
      </CustomAnimatedSection>

      <CustomAnimatedSection classname="container transform-none">
        <BookDemo />
      </CustomAnimatedSection>

      <HomeFooter />

      <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center md:hidden">
        <Button
          variant={'outline'}
          size={'custom'}
          className="pointer-events-auto rounded-[35px] bg-white-alpha px-6 py-3.5 backdrop-blur-20px">
          <p className="text-cap-1-bold-home">Book a demo</p>
        </Button>
      </div>
    </div>
  )
}
