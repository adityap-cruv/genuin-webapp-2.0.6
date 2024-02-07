import React from 'react'
import style from './brand.module.scss'
import Banner from '@components/business/banner'
import OnlineCommunity from '@components/business/brand-page/online-community'
import EngageCustomers from '@components/business/brand-page/engage-customers'
import EngagementHooks from '@components/business/brand-page/engagement-hooks'
import FunnelEngagement from '@components/business/brand-page/funnel-engagement'
import VideoBasedCommunities from '@components/business/brand-page/video-based-communities'
import Testimonial from '@components/business/brand-page/testimonials'
import GetInTouch from '@components/business/brand-page/get-in-touch'
import dunkingLogo from '@images/business/brand-page/brands/dunking.svg'
import dunkingBanner from '@images/business/brand-page/brands/dunking.webp'
import instacartLogo from '@images/business/brand-page/brands/instacart.svg'
import instacartBanner from '@images/business/brand-page/brands/instacart.webp'
import udemyLogo from '@images/business/brand-page/brands/udemy.svg'
import udemyBanner from '@images/business/brand-page/brands/udemy.webp'
import starbucksLogo from '@images/business/brand-page/brands/starbucks.svg'
import starbucksBanner from '@images/business/brand-page/brands/starbucks.webp'
import tedLogo from '@images/business/brand-page/brands/ted.svg'
import tedBanner from '@images/business/brand-page/brands/ted.webp'
import lowesLogo from '@images/business/brand-page/brands/lowes.svg'
import lowesBanner from '@images/business/brand-page/brands/lowes.webp'
import { NavBar } from '@components/pages/home/nav-bar'
import Footer from '@components/business/footer'
import AsSeenIn from '@components/business/as-seen-in'

export default function Desktop() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        {/* Banner component */}
        <div className="pt-navbar">
          <Banner
            titleHtmlTag={1}
            bannerTitle={'Making Community Engaging on your App & Web'}
            titleVariant={'black'}
            bannerCaption={`Embedded Communities offer brands a compelling, interactive alternative to third-party social channels, free from privacy concerns, data ownership issues, and algorithm complexities.`}
            paraVariant={'medium'}
            buttonData={[
              { text: 'Get Started', variant: 'solid' },
              { text: 'Contact Sales', variant: 'outline' },
            ]}
            bannerImg={null}
            brandImages={[
              { img: dunkingLogo, alt: 'dunking', banner: dunkingBanner },
              { img: instacartLogo, alt: 'instacart', banner: instacartBanner },
              { img: udemyLogo, alt: 'udemy', banner: udemyBanner },
              { img: starbucksLogo, alt: 'starbucks', banner: starbucksBanner },
              { img: tedLogo, alt: 'TED', banner: tedBanner },
              { img: lowesLogo, alt: 'lowes', banner: lowesBanner },
            ]}
          />
        </div>
      </div>

      <div className={style.container}>
        {/* Online Community component */}
        <OnlineCommunity />
        {/* Engage Customers component */}
        <EngageCustomers />
        {/* Engagement Hooks component */}
        <EngagementHooks />
        {/* Funnel Engagement component */}
        <FunnelEngagement />
        {/* Video Based Communities component */}
        <VideoBasedCommunities />
        {/* Testimonial component */}
        <Testimonial />
        {/* Get In Touch component */}
        <GetInTouch />
      </div>
      <AsSeenIn />
      <Footer />
    </>
  )
}
