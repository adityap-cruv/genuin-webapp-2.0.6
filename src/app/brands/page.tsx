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
import dunkingBanner from '@images/business/brand-page/brands/dunking.png'
import instacartLogo from '@images/business/brand-page/brands/instacart.svg'
import instacartBanner from '@images/business/brand-page/brands/instacart.png'
import udemyLogo from '@images/business/brand-page/brands/udemy.svg'
import udemyBanner from '@images/business/brand-page/brands/udemy.png'
import starbucksLogo from '@images/business/brand-page/brands/starbucks.svg'
import starbucksBanner from '@images/business/brand-page/brands/starbucks.png'
import tedLogo from '@images/business/brand-page/brands/ted.svg'
import tedBanner from '@images/business/brand-page/brands/ted.png'
import lowesLogo from '@images/business/brand-page/brands/lowes.svg'
import lowesBanner from '@images/business/brand-page/brands/lowes.png'
import { NavBar } from '@components/pages/home/nav-bar'

export default function BrandsPage() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        {/* Banner component */}
        <div className="pt-navbar">
          <Banner
            titleHtmlTag={1}
            bannerTitle={'Making Community Engaging for Everyone'}
            titleVariant={'black'}
            bannerCaption={`Nova is supporting the world's biggest brands, the next generation of community builders, and the knowledge seekers in between.`}
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
    </>
  )
}
