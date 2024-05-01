import React from 'react'
import style from './brand.module.scss'
import OnlineCommunity from '@components/business/brand-page/online-community'
import EngagementHooks from '@components/business/brand-page/engagement-hooks'
import VideoBasedCommunities from '@components/business/brand-page/video-based-communities'
import Testimonial from '@components/business/brand-page/testimonials'
import GetInTouch from '@components/business/brand-page/get-in-touch'
import { NavBar } from '@components/pages/home/nav-bar'
import AsSeenIn from '@components/business/as-seen-in'
import onlinecommunity from '@images/business/brand-page/online-community-group.webp'
import { Button } from '@components/ui/button'
import { ContactUs } from '@components/common/modals/contact-us'
import { Footer } from '@components/pages/home/footer'

export default function Desktop() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        <div className="container flex h-[100vh] items-center">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-8">
              <div className="w-2/5">
                <p className="my-4 text-new-h1" style={{ fontSize: '56px' }}>
                  Get First Party Data & Capabilities to Moderate your Communities
                </p>
                <p className="my-4 text-new-para-1">
                  Full Transparency, access, and control over your community’s activity with help from AI assistants{' '}
                </p>
                <ContactUs>
                  <Button
                    size="custom"
                    className="bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-sm text-monochrome-white">Get Started</p>
                  </Button>
                </ContactUs>
              </div>
              <div className=" h-full w-3/5 items-center justify-center">
                <img loading="lazy" fetchPriority="low" decoding="async" src={onlinecommunity.src} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Online Community component */}
        <OnlineCommunity />
        {/* Engage Customers component */}
        {/* <EngageCustomers /> */}
        {/* Engagement Hooks component */}
        <EngagementHooks />
        {/* Funnel Engagement component */}
        {/* <FunnelEngagement /> */}
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
