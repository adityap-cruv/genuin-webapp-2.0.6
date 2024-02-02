import React from 'react'
import style from './marketing.module.scss'
import Banner from '@components/business/banner'
import bannerIMG from '@images/business/marketing-page/banner.webp'
import Impressions from '@components/business/marketing-page/impressions'
import Precision from '@components/business/marketing-page/precision'
import CustomQr from '@components/business/marketing-page/customqr'
import SocialConnections from '@components/business/marketing-page/social-connections'
import Communities from '@components/business/marketing-page/communities'
import { NavBar } from '@components/pages/home/nav-bar'
import Footer from '@components/business/footer'
import cxr from '@images/business/marketing-page/communities/cxr.webp'
import social_share from '@images/business/marketing-page/communities/social_share.webp'
import mail from '@images/business/marketing-page/communities/mail.webp'
import sms from '@images/business/marketing-page/communities/sms.webp'
import whatsapp from '@images/business/marketing-page/communities/whatsapp.webp'
import AsSeenIn from '@components/business/as-seen-in'

// TODO: This page has bug on SocialConnections. Fix It.
export default function MarketingPage() {
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        {/* Banner component */}
        <div className="pt-32">
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
        <CustomQr />
        <SocialConnections />
        <Communities />
      </div>
      <AsSeenIn />
      <Footer />
    </>
  )
}
