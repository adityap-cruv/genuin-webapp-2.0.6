'use client'
import React, { useEffect, useState } from 'react'
import style from './marketing.module.scss'
import Banner from '@components/business/banner'
import bannerIMG from '@images/business/marketing-page/banner.webp'
import Impressions from '@components/business/marketing-page/impressions'
import Precision from '@components/business/marketing-page/precision'
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
import { Button } from '@components/ui/button'

export const Desktop = () => {
  const brandImages: any = [
    { alt: 'cxr', banner: cxr },
    { alt: 'social_share', banner: social_share },
    { alt: 'mail', banner: mail },
    { alt: 'sms', banner: sms },
    { alt: 'whatsapp', banner: whatsapp },
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex: any) => (prevIndex + 1) % brandImages?.length)
    }, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [brandImages])
  return (
    <>
      <div className={style.sectionOne}>
        <NavBar />
        <div className="container flex h-[100vh] items-center pt-20">
          <div className="flex flex-col justify-between">
            <div className="flex items-center">
              <div className="w-1/2">
                <p className="my-4 text-new-h1" style={{ fontSize: '56px' }}>
                  Unleash the Power of Your Community
                </p>
                <p className="my-4 text-new-para-1">
                  Transform your marketing strategies with our dynamic solutions – from SMS and Email to Programmatic
                  and Social, all centered around short video-based knowledge sharing within thriving communities.
                </p>
                <Button
                  size="custom"
                  className="bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                  <p className="text-new-sm">Get Started</p>
                </Button>
              </div>
              <div className="flex h-[70vh] w-1/2 justify-center">
                <img
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  className="h-full"
                  src={brandImages[currentIndex].banner.src}
                />
              </div>
            </div>
          </div>
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
