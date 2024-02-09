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
import toyotaLogo from '@images/business/brand-page/brands/toyota.svg'
import toyotaBanner from '@images/business/brand-page/brands/toyota.webp'
import niveaLogo from '@images/business/brand-page/brands/nivea.svg'
import niveaBanner from '@images/business/brand-page/brands/nivea.webp'
import sephoraLogo from '@images/business/brand-page/brands/sephora.svg'
import sephoraBanner from '@images/business/brand-page/brands/sephora.webp'
import doveLogo from '@images/business/brand-page/brands/dove.svg'
import doveBanner from '@images/business/brand-page/brands/dove.webp'
import cocacolaLogo from '@images/business/brand-page/brands/cocacola.svg'
import cocacolaBanner from '@images/business/brand-page/brands/cocacola.webp'
import { NavBar } from '@components/pages/home/nav-bar'
import Footer from '@components/business/footer'
import AsSeenIn from '@components/business/as-seen-in'
import onlinecommunity from '@images/business/brand-page/online-community-group.webp'

export default function Desktop() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        {/* Banner component */}
        <div className="pt-navbar">
          <Banner
            titleHtmlTag={1}
            bannerTitle={'Get First-Party Data & Generate Unique Audience Segments.'}
            titleVariant={'black'}
            bannerCaption={`Control and Moderate posts and own data in Your video based Community`}
            paraVariant={'medium'}
            buttonData={[{ text: 'Get Started', variant: 'solid', path: '' }]}
            bannerImg={onlinecommunity}
            brandImages={null}
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
