'use client'
import { HomeNavBar } from './home-nav'
import bg from '@images/home/index-bg.svg'
import buildArt from '@images/home/build-art.png'
import icCommunity from '@images/home/icon-community.svg'
import icGraph from '@images/home/icon-graph.svg'
import icVideo from '@images/home/icon-video.svg'
import { Button } from '@components/ui/button'
import { HomeFooter } from './home-footer'
import { TickerCarousel } from './ticker-carousel'
import { BookDemo } from './book-demo'
import { CustomAnimatedLogos, CustomAnimatedSection } from './animations'
import { Tile } from './tile'
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
        <span className="text-purple text-transparent">Build </span>
        your Community Media Network
      </p>
    ),
    subtitle:
      'Establish no-code, social communities with short videos that seamlessly integrate into your owned digital properties and beyond.',
    imageSrc: (
      <div className="relative flex aspect-square w-full items-center md:w-5/12">
        <img src={buildArt.src} className="absolute w-full rounded-[36px]" alt="Information Section" />
        <CustomAnimatedLogos
          className="absolute bottom-[35%] right-[8%] z-0 transform-none"
          animationClass="animate-rotateLeft">
          <img src={BAJoinCommunity.src} alt="joincommunity" className="h-10 lg:h-12 " />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          className="absolute bottom-[12%] right-[24%] z-0 transform-none"
          animationClass="animate-rotateRight">
          <img src={BAcommunityTab.src} alt="communitytab" className="h-20 md:h-24 xl:h-28" />
        </CustomAnimatedLogos>
      </div>
    ),
  },
  {
    title: (
      <p className="text-center text-title-2-bold-home-m md:text-left md:text-title-2-bold-home">
        <span className="text-purple text-transparent">Engage </span>
        your consumers with partner content
      </p>
    ),
    subtitle:
      'Populate with both brand and performance content from partners, advertisers, and creators to ignite your community. ',
    imageSrc: (
      <div className="relative aspect-animatedDiv w-full rounded-[36px] bg-[#F7F9FC] md:w-5/12">
        <img src={EngageArtBg.src} alt="community" className="absolute w-full" />
        <CustomAnimatedLogos
          className="absolute left-[5%] top-[30%] z-0 transform-none"
          animationClass="animate-zoomInOut">
          <img src={EAComment.src} alt="comment" className="h-14 md:h-16" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          className="absolute bottom-[25%] left-[3%] z-0 transform-none"
          animationClass="animate-zoomInOut">
          <img src={EAShare.src} alt="share" className="h-14 md:h-16" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          className="absolute bottom-[34%] right-[10%] z-0 transform-none"
          animationClass="animate-zoomInOut">
          <img src={EAJoin.src} alt="join" className="h-10 md:h-12" />
        </CustomAnimatedLogos>
      </div>
    ),
  },
  {
    title: (
      <p className="text-center text-title-2-bold-home-m md:text-left md:text-title-2-bold-home">
        <span className="text-purple text-transparent">Activate</span> your marketing flywheel
      </p>
    ),
    subtitle:
      'Launch, grow, manage, and market across all touchpoints. Recruit & retain community builders, integrate content, and optimize the entire experience.',
    imageSrc: (
      <div className="relative aspect-animatedDiv w-full rounded-[36px] bg-[#F7F9FC] md:w-5/12">
        <CustomAnimatedLogos className="absolute right-[12%] z-0 flex h-full -translate-x-20 items-end duration-1800">
          <img src={Mobile.src} alt="community" className="h-[90%]" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          className="absolute right-[15%] z-0 flex h-full transform-none items-end"
          animationClass="animate-zoomIn duration-2600">
          <img src={Graph.src} alt="community" className="h-[90%]" />
        </CustomAnimatedLogos>
      </div>
    ),
  },
  {
    title: (
      <p className="text-center text-title-2-bold-home-m md:text-left md:text-title-2-bold-home">
        <span className="text-purple text-transparent">Boost </span>
        your incremental revenue
      </p>
    ),
    subtitle:
      'Monetize new vertical video inventory to increase time spent on your owned and operated channels, conversion, and LTV.',
    imageSrc: (
      <div className="relative aspect-animatedDiv w-full rounded-[36px] bg-[#F7F9FC] md:w-5/12">
        <CustomAnimatedLogos className="absolute right-[12%] z-0 flex h-full -translate-x-20 items-end duration-1800">
          <img src={Mobile.src} alt="community" className="h-[90%]" />
        </CustomAnimatedLogos>
        <CustomAnimatedLogos
          className="absolute right-[15%] z-0 flex h-full transform-none items-end"
          animationClass="animate-zoomIn duration-2600">
          <img src={Graph.src} alt="community" className="h-[90%]" />
        </CustomAnimatedLogos>
      </div>
    ),
  },
]

export function HomeComponent() {
  return (
    <div className="font-manrope bg-monochrome-white text-[#101010] md:h-body">
      <HomeNavBar />
      <div
        className="relative h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${bg.src})`,
        }}>
        <CustomAnimatedLogos className="absolute left-[32vw] top-[6vh] z-0 hidden -translate-y-20 translate-x-10 duration-3000 md:block">
          <img src={icCommunity.src} alt="community" className="h-14" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos className="absolute left-[7vw] top-[44vh] z-0 hidden  -translate-x-28 translate-y-16 duration-3000 md:block">
          <img src={icGraph.src} alt="graph" className="h-9" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos className="absolute bottom-[8vh] left-[26vw] z-0 hidden translate-x-32 translate-y-20 duration-3000 md:block">
          <img src={icVideo.src} alt="video" className="h-12" />
        </CustomAnimatedLogos>

        <CustomAnimatedSection className="container z-10">
          <CommunityReimagined />
        </CustomAnimatedSection>
      </div>

      <CustomAnimatedSection>
        <TickerCarousel />
      </CustomAnimatedSection>

      {infoData.map((data, index) => (
        <CustomAnimatedSection key={index} className="duration-2200">
          <Tile title={data.title} subtitle={data.subtitle} imageSrc={data.imageSrc} />
        </CustomAnimatedSection>
      ))}

      <CustomAnimatedSection className="transform-none">
        <BookDemo />
      </CustomAnimatedSection>
      <HomeFooter />
      <ContactUs>
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-20 flex justify-center md:hidden">
          <Button
            variant={'outline'}
            size={'custom'}
            className="pointer-events-auto rounded-[35px] bg-white-alpha px-6 py-3.5 backdrop-blur-20px hover:bg-monochrome-black hover:text-monochrome-white">
            <p className="text-cap-1-bold-home">Book a demo</p>
          </Button>
        </div>
      </ContactUs>
    </div>
  )
}
