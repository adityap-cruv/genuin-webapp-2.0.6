import React from 'react'
import style from './brand.module.scss'
import OnlineCommunity from '@components/business/brand-page/online-community'
import EngageCustomers from '@components/business/brand-page/engage-customers'
import EngagementHooks from '@components/business/brand-page/engagement-hooks'
import FunnelEngagement from '@components/business/brand-page/funnel-engagement'
import VideoBasedCommunities from '@components/business/brand-page/video-based-communities'
import Testimonial from '@components/business/brand-page/testimonials'
import GetInTouch from '@components/business/brand-page/get-in-touch'
import { NavBar } from '@components/pages/home/nav-bar'
import Footer from '@components/business/footer'
import AsSeenIn from '@components/business/as-seen-in'
import onlinecommunity from '@images/business/brand-page/online-community-group.webp'
import { Button } from '@components/ui/button'

export default function Desktop() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        <div className="container flex h-[100vh] items-center">
          <div className="flex flex-col justify-between">
            <div className="flex items-center">
              <div className="w-1/2">
                <p className="my-4 text-new-h1" style={{ fontSize: '56px' }}>
                  Get First-Party Data & Generate Unique Audience Segments.
                </p>
                <p className="my-4 text-new-para-1">
                  Control and Moderate posts and own data in Your video based Community
                </p>
                <Button
                  size="custom"
                  className="bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-sm">Get Started</p>
                </Button>
              </div>
              <div className=" h-full w-1/2 items-center justify-center">
                <img loading="lazy" fetchPriority="low" decoding="async" src={onlinecommunity.src} />
              </div>
            </div>
          </div>
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
