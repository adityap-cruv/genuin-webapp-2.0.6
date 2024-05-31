'use client'
import { HomeNavBar } from './home-nav'
import bg from '@images/home/index-bg.png'
import buildArt from '@images/home/build-art.png'
import icCommunity from '@images/home/icon-community.svg'
import icGraph from '@images/home/icon-graph.svg'
import icVideo from '@images/home/icon-video.svg'
import { Button } from '@components/ui/button'
import { HomeFooter } from './home-footer'
import { TickerCarousel } from './ticker-carousel'
import { PartnershipEcosystem } from './partnership-ecosystem'
import { BookDemo } from './book-demo'
import { CustomAnimatedLogos, CustomAnimatedSection } from './animations'
import { BuildEnagageBoost } from './build-engage-boost'
import { CommunityReimagined } from './community-reimagined'
import Graph from '@images/home/boost-graph.svg'
import Mobile from '@images/home/boost-mobile.svg'
import EngageArtBg from '@images/home/engage-art-bg.svg'
import EAComment from '@images/home/EAComment.svg'
import EAJoin from '@images/home/EAJoin.svg'
import EAShare from '@images/home/EAShare.svg'
import BAcommunityTab from '@images/home/BAcommunityTab.svg'
import BAJoinCommunity from '@images/home/BAJoinCommunity.svg'
import { ContactUs } from '@components/common/modals/contact-us'

const infoData = [
  {
    title: (
      <p className="text-center text-title-2-bold-home-m md:text-left md:text-title-2-bold-home">
        <span className="bg-gradient-to-r from-[#9395FF] to-[#1685FD] bg-clip-text text-transparent">Build </span>
        your Community Media Network
      </p>
    ),
    subtitle:
      'Establish no-code, social communities with short videos that seamlessly integrate into your owned digital properties and beyond.',
    imageSrc: (
      <div className="relative flex aspect-square w-full items-center md:w-1/2">
        <img src={buildArt.src} className="absolute w-full rounded-[36px] shadow-md" alt="Information Section" />
        <CustomAnimatedLogos
          classname="absolute bottom-[35%] right-[8%] opacity-100 transform-none z-0"
          animationClass="animate-rotateLeft">
          <img src={BAJoinCommunity.src} alt="joincommunity" className="h-10 lg:h-12 " />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          classname="absolute bottom-[12%] right-[24%] opacity-100 transform-none z-0"
          animationClass="animate-rotateRight">
          <img src={BAcommunityTab.src} alt="communitytab" className="h-20 lg:h-32 " />
        </CustomAnimatedLogos>
      </div>
    ),
  },
  {
    title: (
      <p className="text-center text-title-2-bold-home-m md:text-left md:text-title-2-bold-home">
        <span className="bg-gradient-to-r from-[#9395FF] to-[#1685FD] bg-clip-text text-transparent">Engage </span>
        your consumers with partner content
      </p>
    ),
    subtitle: 'Engage with your audience through interactive and engaging content tailored to their interests.',
    imageSrc: (
      <div className="relative aspect-animatedDiv w-full rounded-[36px] bg-monochrome-white shadow-md md:w-1/2">
        <img src={EngageArtBg.src} alt="community" className="absolute w-full" />
        <CustomAnimatedLogos
          classname="absolute top-[30%] left-[5%] opacity-100 transform-none z-0"
          animationClass="animate-zoomInOut">
          <img src={EAComment.src} alt="comment" className="h-14 md:h-16 lg:h-20" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          classname="absolute bottom-[25%] left-[3%] opacity-100 transform-none z-0"
          animationClass="animate-zoomInOut">
          <img src={EAShare.src} alt="share" className="h-14 md:h-16 lg:h-20" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          classname="absolute bottom-[34%] right-[10%] opacity-100 transform-none z-0"
          animationClass="animate-zoomInOut">
          <img src={EAJoin.src} alt="join" className="h-10 md:h-12 lg:h-14" />
        </CustomAnimatedLogos>
      </div>
    ),
  },
  {
    title: (
      <p className="text-center text-title-2-bold-home-m md:text-left md:text-title-2-bold-home">
        <span className="bg-gradient-to-r from-[#9395FF] to-[#1685FD] bg-clip-text text-transparent">Boost </span>
        your incremental revenue
      </p>
    ),
    subtitle:
      'Discover new revenue streams by leveraging your content through strategic partnerships and sponsorships.',
    imageSrc: (
      <div className="relative aspect-animatedDiv w-full rounded-[36px] bg-monochrome-white md:w-1/2 ">
        <CustomAnimatedLogos classname="absolute duration-1800 h-full flex items-end -translate-x-20 right-[12%] z-0">
          <img src={Mobile.src} alt="community" className="h-[90%]" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          classname="absolute duration-4000 h-full flex items-end opacity-100 transform-none right-[15%] z-0"
          animationClass="animate-zoomIn">
          <img src={Graph.src} alt="community" className="h-[90%]" />
        </CustomAnimatedLogos>
      </div>
    ),
  },
]

export function HomeComponent() {
  return (
    <div className="font-manrope">
      <HomeNavBar />
      <div
        className="relative h-full w-full bg-cover bg-center md:h-customscreen"
        style={{
          backgroundImage: `url(${bg.src})`,
        }}>
        <CustomAnimatedLogos classname="absolute duration-8000 md:block hidden translate-x-10 -translate-y-20 left-[30%] top-[13%] z-0">
          <img src={icCommunity.src} alt="community" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos classname="absolute duration-8000 md:block -translate-x-28 translate-y-16  hidden left-[10%] top-[43%] z-0">
          <img src={icGraph.src} alt="graph" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos classname="absolute duration-8000 md:block hidden translate-y-20 translate-x-32 left-[23%] bottom-[13%] z-0">
          <img src={icVideo.src} alt="graph" />
        </CustomAnimatedLogos>

        <CustomAnimatedSection classname="container z-10">
          <CommunityReimagined />
        </CustomAnimatedSection>
      </div>

      <CustomAnimatedSection>
        <TickerCarousel />
      </CustomAnimatedSection>

      {infoData.map((data, index) => (
        <CustomAnimatedSection key={index} classname="container duration-2200">
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

      <ContactUs>
        <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center md:hidden">
          <Button
            variant={'outline'}
            size={'custom'}
            className="pointer-events-auto rounded-[35px] bg-white-alpha px-6 py-3.5 backdrop-blur-20px">
            <p className="text-cap-1-bold-home">Book a demo</p>
          </Button>
        </div>
      </ContactUs>
    </div>
  )
}
