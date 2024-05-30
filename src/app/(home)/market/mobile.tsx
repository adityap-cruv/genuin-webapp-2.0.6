'use client'
import React, { useEffect, useState } from 'react'
import { NavBar } from '@components/pages/build/nav-bar'
import cxr from '@images/business/marketing-page/communities/cxr.webp'
import social_share from '@images/business/marketing-page/communities/social_share.webp'
import mail from '@images/business/marketing-page/communities/mail.webp'
import sms from '@images/business/marketing-page/communities/sms.webp'
import whatsapp from '@images/business/marketing-page/communities/whatsapp.webp'
import Link from 'next/link'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import marketbg from '@images/business/marketing-page/market-bg-mobile.webp'
import { Button } from '@components/ui/button'
import { Footer } from '@components/pages/build/footer'
import m1 from '@images/business/marketing-page/m_01.webp'
import m2 from '@images/business/marketing-page/m_02.webp'
import m3 from '@images/business/marketing-page/m_03.webp'
import m4 from '@images/business/marketing-page/m_04_1.webp'
import m5 from '@images/business/marketing-page/m_05.webp'
import m6 from '@images/business/marketing-page/m_06.webp'
import ms1 from '@images/business/marketing-page/m_s1_mobile.webp'
import ms2 from '@images/business/marketing-page/m_s2_mobile.webp'
import ms3 from '@images/business/marketing-page/m_s3_mobile.webp'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ContactUs } from '@components/common/modals/contact-us'

export const Mobile = () => {
  return (
    <>
      <NavBar />
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Footer />
    </>
  )
}

function Component1() {
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
    <div
      className="flex items-center pb-24 pt-36"
      style={{
        background: `url(${marketbg.src}) no-repeat`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backdropFilter: 'blur(100px)',
      }}>
      <div className="container">
        <p className="my-3 text-new-h3">Unleash New Unprecedented Ways to Grow Your Community</p>
        <p
          className="my-3 text-new-para-1"
          style={{
            fontSize: '18px',
          }}>
          Rich feature set for marketing communities is driven by Open Web approach.
        </p>
        <ContactUs>
          <Button
            size="custom"
            className="my-3 bg-new-off-black px-4 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
            <p className="text-new-para-2 text-monochrome-white">Get Started</p>
          </Button>
        </ContactUs>
        <div className="my-4 flex min-h-[300px] items-center justify-center">
          <img loading="lazy" fetchPriority="low" decoding="async" className="h-80" src={whatsapp.src} />
        </div>
      </div>
    </div>
  )
}

function Component2() {
  const marketdata = [
    {
      title: 'Distribute Your Community Widely on the Open Web with Adreels',
      subtitle: 'Publish your community through video ad networks using Genuin AdReels video feed syndication.',
      button: true,
      image: m1,
    },
    {
      title: 'Integrate Seamlessly with Email & SMS Marketing Programs',
      subtitle: 'Attract new members efficiently via through email and SMS system integrations.',
      button: false,
      image: m2,
    },
    {
      title: 'Gain New Community Marketing Assets Automatically',
      subtitle: 'Platform automatically creates dynamic ads, link posts and social content based on community content.',
      button: false,
      image: m3,
    },
    {
      title: 'Incorporate Community Building at Physical Events',
      subtitle:
        'Easily create QR codes that can be printed on signage, print materials, or anywhere to bring new members directly into your community',
      button: false,
      image: m4,
    },
    {
      title: 'Make your Community Visible in Web Search',
      subtitle:
        'Set your community to be available to the public and make it visible to Search Engines and appear in relevant search results.',
      button: false,
      image: m5,
    },
    {
      title: 'Promote Your Community In Native Formats',
      subtitle:
        'Embed automatically created community advertising assets in a wide range of industry standard supported formats',
      button: false,
      image: m6,
    },
  ]
  return (
    <div>
      {marketdata.map((item, index) => (
        <div key={index}>
          <div className="container mb-20">
            <p className="text-new-h2-mobile">{item.title}</p>
            <p className="my-4 text-new-sm">{item.subtitle}</p>
            {item.button && (
              <Link href={{ pathname: PATH_NAME.adreels() }}>
                <Button variant={'outline'} size="custom" className="px-4 py-2">
                  <p className="text-new-para-2">Explore Programmatic Power</p>
                </Button>
              </Link>
            )}
            <div className="flex justify-center">
              <img src={item.image.src} className="mt-2" alt="genuin" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Component3() {
  const [isSelected, setIsSelected] = useState<string | null>('community')

  return (
    <div className="container">
      <p className="text-center text-new-h2-mobile">
        Multiple Entry Points for Customers to Engage in your Communities
      </p>
      <p className="my-4 text-center text-new-sm">
        Bring your community to life! Genuin allows you to embed highlights through short videos, capturing the essence
        of your brand and fostering a sense of belonging among your audience.
      </p>

      <div className="flex justify-center">
        <div className="flex rounded-2xl bg-[#ECEAF2] p-2">
          <div
            className={`${
              isSelected === 'community' && 'bg-primary text-new-off-white'
            } rounded-lg px-4 py-2 text-new-para-2-mobile`}
            onClick={() => {
              setIsSelected('community')
            }}>
            Community
          </div>
          <div
            className={`${
              isSelected === 'loop' && 'bg-primary text-new-off-white'
            } rounded-lg px-4 py-2 text-new-para-2-mobile`}
            onClick={() => {
              setIsSelected('loop')
            }}>
            Loops
          </div>
          <div
            className={`${
              isSelected === 'post' && 'bg-primary text-new-off-white'
            } rounded-lg px-4 py-2 text-new-para-2-mobile`}
            onClick={() => {
              setIsSelected('post')
            }}>
            Posts
          </div>
        </div>
      </div>

      <div className="my-12 flex justify-center">
        <img
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          src={isSelected === 'community' ? ms1.src : isSelected === 'loop' ? ms2.src : ms3.src}
          alt="genuin"
        />
      </div>
    </div>
  )
}

function Component4() {
  return (
    <div className="mt-10 flex h-40 flex-col items-center justify-center gap-4 bg-monochrome-9 ">
      <p className="text-new-h3">As Seen In</p>
      <div className="flex gap-8">
        <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
          <Link href={{ pathname: PATH_NAME.businessinsider() }}>
            <img
              loading="lazy"
              fetchPriority="low"
              className="h-8"
              decoding="async"
              src={businessInsider.src}
              alt="genuin"
            />
          </Link>
        </div>
        <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
          <Link href={{ pathname: PATH_NAME.yahoo() }}>
            <img loading="lazy" fetchPriority="low" className="h-8" decoding="async" src={yahoo.src} alt="genuin" />
          </Link>
        </div>
      </div>
    </div>
  )
}
