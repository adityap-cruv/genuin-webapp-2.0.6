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
import cxr from '@images/business/marketing-page/communities/cxr.png'
import social_share from '@images/business/marketing-page/communities/social_share.png'
import mail from '@images/business/marketing-page/communities/mail.png'
import sms from '@images/business/marketing-page/communities/sms.png'
import whatsapp from '@images/business/marketing-page/communities/whatsapp.png'
import AsSeenIn from '@components/business/as-seen-in'

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
            bannerCaption={`Transform your marketing strategies with our dynamic solutions – from SMS and Email to Programmatic and Social, all centered around short video-based knowledge sharing within thriving communities.`}
            paraVariant={'medium'}
            buttonData={[{ text: 'Get Started', variant: 'solid' }]}
            bannerImg={null}
            brandImages={[
              { alt: 'cxr', banner: cxr },
              { alt: 'social_share', banner: social_share },
              { alt: 'mail', banner: mail },
              { alt: 'sms', banner: sms },
              { alt: 'whatsapp', banner: whatsapp },
            ]}
          />
        </div>
      </div>

      <div className={style.container}>
        <Impressions />
        <Precision />
        <SocialConnections />
        <Communities />
      </div>
      <AsSeenIn />
      <Footer />
    </>
  )
}
