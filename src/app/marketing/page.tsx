import React from 'react'
import style from './marketing.module.scss'
import Banner from '@components/business/banner'
import bannerIMG from '@images/business/marketing-page/banner.png'
import Impressions from '@components/business/marketing-page/impressions'
import Precision from '@components/business/marketing-page/precision'
import SocialConnections from '@components/business/marketing-page/social-connections'
import Communities from '@components/business/marketing-page/communities'
import { NavBar } from '@components/pages/home/nav-bar'
import Footer from '@components/business/footer'

export default function MarketingPage() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        {/* Banner component */}
        <div className="pt-navbar">
          <Banner
            titleHtmlTag={1}
            bannerTitle={'Unleash the Power of Your Community'}
            titleVariant={'black'}
            bannerCaption={`Transform your marketing strategies with our dynamic solutions – from SMS and Email to Programmatic and Social, all centered around short video-based knowledge sharing within thriving communities.s`}
            paraVariant={'medium'}
            buttonData={[{ text: 'Get Started', variant: 'solid' }]}
            bannerImg={bannerIMG}
            brandImages={null}
          />
        </div>
      </div>

      <div className={style.container}>
        <Impressions />
        <Precision />
        <SocialConnections />
        <Communities />
      </div>
      <Footer />
    </>
  )
}
