'use client'
import React, { useEffect, useRef, useState } from 'react'
import { NavBar } from '@components/pages/home/nav-bar'
import cxr from '@images/business/marketing-page/communities/cxr.webp'
import social_share from '@images/business/marketing-page/communities/social_share.webp'
import mail from '@images/business/marketing-page/communities/mail.webp'
import sms from '@images/business/marketing-page/communities/sms.webp'
import whatsapp from '@images/business/marketing-page/communities/whatsapp.webp'
import Link from 'next/link'
import SMSTab from '@images/business/marketing-page/sms-engagement-mobile.webp'
import EmailBoxTab from '@images/business/marketing-page/email-engagement-mobile.webp'
import precision from '@images/business/marketing-page/precision.webp'
import customqr from '@images/business/marketing-page/customqr.webp'
import socialConnections1 from '@images/business/marketing-page/connections/socialConnections1.webp'
import socialConnections2 from '@images/business/marketing-page/connections/socialConnections2.webp'
import socialConnections3 from '@images/business/marketing-page/connections/social-connections.webp'
import communities from '@images/business/marketing-page/communities-mobile.webp'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import marketbg from '@images/business/marketing-page/market-bg-mobile.png'
import { Button } from '@components/ui/button'
import { Footer } from '@components/pages/home/footer'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'

export const Mobile = () => {
  return (
    <>
      <NavBar />
      <Component1 />
      <Component2 />
      <Component3 />
      <Component4 />
      <Component5 />
      <Component6 />
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
      className="flex h-screen items-center pt-navbar"
      style={{
        background: `url(${marketbg.src}) no-repeat`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backdropFilter: 'blur(100px)',
      }}>
      <div className="container">
        <p className="my-3 w-3/4 text-new-h3">Unleash the Power of Your Community</p>
        <p className="my-3 text-new-md">
          Transform your marketing strategies with our dynamic solutions – from SMS and Email to Programmatic and
          Social, all centered around short video-based knowledge sharing within thriving communities.
        </p>
        <Button size="custom" className="my-3 bg-new-off-black px-5 py-4 after:bg-new-dark-grey hover:bg-new-dark-grey">
          <p className="text-new-para-2">Get Started</p>
        </Button>
        <div className="my-4 flex min-h-[300px] items-center justify-center">
          <img
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            className="h-80"
            src={brandImages[currentIndex].banner.src}
          />
        </div>
      </div>
    </div>
  )
}

function Component2() {
  const imgRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const value = Number(latest.toPrecision(2))
    if (value >= 0.32 && value <= 0.58) {
      const calcValue = Math.floor((value - 0.32) * 10)
      if (currentIndexRef.current !== calcValue) {
        toggleIndex(currentIndexRef.current, calcValue)
        currentIndexRef.current = calcValue
      }
    }
  })

  function toggleIndex(oldIndex: number, newIndex: number) {
    const images = imgRef.current?.children
    // Edge case prevention
    if (oldIndex === 3 || newIndex === 3) return
    images?.item(oldIndex)?.classList.toggle('opacity-0')
    images?.item(newIndex)?.classList.toggle('opacity-0')
  }

  return (
    <>
      <div className="container relative mt-10 h-[300%]">
        <div id="carousel" className="sticky top-0 h-fit">
          <div className="h-full w-full">
            <div className="h-fit">
              <p className="my-2 text-new-h2-mobile">Instant Impact, Lasting Impressions</p>
              <p className="my-2 text-new-para-2">
                Create custom email and SMS campaigns and connect with customers on the go with integrated marketing
                tools.
              </p>
            </div>
            <div className="mt-4 flex w-full items-center justify-center">
              <div
                ref={imgRef}
                className="relative  [&>div]:inset-0 [&>div]:transition-opacity [&>div]:duration-200 [&>div]:ease-in">
                <div className="inset-0 flex flex-col justify-center">
                  <img
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    className="h-[50vh] w-auto"
                    src={SMSTab.src}
                  />
                  <div className="flex w-full justify-between">
                    <hr className="w-2/5 border-b-2" />
                    <hr className="w-2/5 border-b-2 border-new-light-grey" />
                  </div>
                  <div>
                    <p className="my-4 text-new-h4-mobile">SMS Engagement</p>
                    <p className="my-4 text-new-para-2">
                      Elevate your marketing game with Genuin's SMS engagement. Deliver concise, powerful messages
                      through short videos that capture attention instantly and resonate with your audience.
                    </p>
                    <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
                      <p className="text-new-para-2">Experience SMS Revolution</p>
                    </Button>
                  </div>
                </div>
                <div className="absolute flex flex-col justify-center opacity-0">
                  <img
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    className="h-[50vh] w-auto"
                    src={EmailBoxTab.src}
                  />
                  <div className="flex w-full justify-between">
                    <hr className="w-2/5 border-b-2 border-new-light-grey" />
                    <hr className="w-2/5 border-b-2" />
                  </div>
                  <div>
                    <p className="my-4 text-new-h4-mobile">Email Engagement</p>
                    <p className="my-4 text-new-para-2">
                      Say goodbye to traditional emails your brand’s email engagement lets you connect on a deeper level
                      through compelling short videos, making every interaction memorable and meaningful.{' '}
                    </p>
                    <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
                      <p className="text-new-para-2">Experience SMS Revolution</p>
                    </Button>
                  </div>
                </div>
                <div className="absolute flex flex-col justify-center opacity-0">
                  <img
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    className="h-[50vh] w-auto"
                    src={EmailBoxTab.src}
                  />
                  <div className="flex w-full justify-between">
                    <hr className="w-2/5 border-b-2 border-new-light-grey" />
                    <hr className="w-2/5 border-b-2" />
                  </div>
                  <div>
                    <p className="my-4 text-new-h4-mobile">Email Engagement</p>
                    <p className="my-4 text-new-para-2">
                      Say goodbye to traditional emails your brand’s email engagement lets you connect on a deeper level
                      through compelling short videos, making every interaction memorable and meaningful.{' '}
                    </p>
                    <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
                      <p className="text-new-para-2">Experience SMS Revolution</p>
                    </Button>
                  </div>
                </div>{' '}
                {/* <div className="h-100 w-100 absolute bg-new-off-black opacity-0"></div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// function Component2() {
//   return (
//     <>
//       <div className="container">
//         <p className="my-2 text-new-h2-mobile">Instant Impact, Lasting Impressions</p>
//         <p className="my-2 text-new-para-2">
//           Create custom email and SMS campaigns and connect with customers on the go with integrated marketing tools.
//         </p>
//         <div className="flex flex-col justify-center">
//           <img loading="lazy" fetchPriority="low" decoding="async" className="h-[50vh] w-auto" src={SMSTab.src} />
//           <div className="flex w-full justify-between">
//             <hr className="w-2/5 border-b-2" />
//             <hr className="w-2/5 border-b-2 border-new-light-grey" />
//           </div>
//           <div>
//             <p className="my-4 text-new-h4-mobile">SMS Engagement</p>
//             <p className="my-4 text-new-para-2">
//               Elevate your marketing game with Genuin's SMS engagement. Deliver concise, powerful messages through short
//               videos that capture attention instantly and resonate with your audience.
//             </p>
//             <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
//               <p className="text-new-para-2">Experience SMS Revolution</p>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

function Component3() {
  return (
    <div className="container h-fit pt-10">
      <p className="my-4 text-new-h2-mobile">Precision in Every Pixel, Impact in Every Frame</p>
      <p className="my-4 text-new-para-2">
        With Genuin's Programmatic Engagement, take control of your marketing strategy. Deliver targeted short videos
        seamlessly, ensuring your message reaches the right audience at the right time.
      </p>
      <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
        <p className="text-new-para-2">Explore Programmatic Power</p>
      </Button>
      <div className="flex justify-center">
        <img loading="lazy" fetchPriority="low" decoding="async" className="my-6 mb-10 w-11/12" src={precision.src} />
      </div>

      <p className="my-4 text-new-h2-mobile">
        Custom QR code generation to grow your community on digital and physical media
      </p>
      <div className="flex justify-center">
        <img loading="lazy" fetchPriority="low" decoding="async" className="my-6 mb-10 w-11/12" src={customqr.src} />
      </div>
    </div>
  )
}

function Component4() {
  return (
    <div className="container flex h-fit flex-col items-center pt-10">
      <div className="flex h-fit flex-col items-center justify-center">
        <p className="my-2 w-3/4 text-center text-new-h2-mobile">Fuel Social Connections with Video Brilliance</p>
        <p className="my-2 text-center text-new-para-2">
          Transform your social media presence with Genuin. Craft engaging short videos that resonate with your
          community, driving conversations, and fostering genuine connections.
        </p>
      </div>
      <div className="flex w-full justify-center">
        <Accordion type="single" defaultValue="connect" collapsible className="px-3 sm:w-4/5">
          <AccordionItem value="connect" className="border-none ">
            <AccordionTrigger className="items-baseline">
              <div className="flex flex-col items-start">
                <h3 className="mb-2 text-new-h3-mobile">Content Marketing</h3>
                <p className="text-start text-new-para-1">
                  Transform your social media presence with Genuin. Craft engaging short videos that resonate with your
                  community, driving conversations, and fostering genuine connections.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
              <Image priority loading="eager" className="sm:w-1/2" src={socialConnections1} alt="connect" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="discover" className="border-none ">
            <AccordionTrigger className="items-baseline">
              <div className="flex flex-col items-start">
                <h3 className="mb-2 text-new-h3-mobile">SEO Tools</h3>
                <p className="text-start text-new-para-1">
                  Help people find your community with SEO tools to edit title tags, meta descriptions, and content
                  details.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
              <Image
                unoptimized
                priority
                loading="eager"
                className="sm:w-1/2"
                src={socialConnections2}
                alt="discover"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="learn" className="border-none ">
            <AccordionTrigger className="items-baseline">
              <div className="flex flex-col items-start">
                <h3 className="mb-2 text-new-h3-mobile">Social Media Ads</h3>
                <p className="text-start text-new-para-1">
                  Transform your social media presence with Genuin. Craft engaging short videos that resonate with your
                  community, driving conversations, and fostering genuine connections.
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="[&>div]:flex [&>div]:w-full [&>div]:justify-center">
              <Image priority unoptimized loading="eager" className="sm:w-1/2" src={socialConnections3} alt="learn" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

function Component5() {
  return (
    <div className="container flex h-fit flex-col items-center pt-10">
      <p className="my-4 text-center text-new-h2-mobile">Showcase Your Embed Community, Tell Your Story</p>
      <p className="my-4 text-center text-new-para-2">
        Bring your community to life! Genuin allows you to embed highlights through short videos, capturing the essence
        of your brand and fostering a sense of belonging among your audience.
      </p>

      <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
        <p className="text-new-para-2">Highlight Your Community</p>
      </Button>
      <div className="flex justify-center">
        <img loading="lazy" fetchPriority="low" decoding="async" className="my-6 w-11/12" src={communities.src} />
      </div>
    </div>
  )
}

function Component6() {
  return (
    <div className="mt-10 flex h-40 flex-col items-center justify-center gap-4 bg-monochrome-9 ">
      <p className="text-new-h3">As Seen In</p>
      <div className="flex gap-8">
        <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
          <img
            loading="lazy"
            fetchPriority="low"
            className="h-8"
            decoding="async"
            src={businessInsider.src}
            alt="genuin"
          />
          {/* <Image priority loading="eager" src={businessInsider} alt={`businessInsider`} /> */}
        </div>
        <div className="flex items-center justify-center rounded-lg bg-monochrome-white px-6 py-2 ">
          <img loading="lazy" fetchPriority="low" className="h-8" decoding="async" src={yahoo.src} alt="genuin" />
          {/* <Image priority loading="eager" src={yahoo} alt={`yahoo`} /> */}
        </div>
      </div>
    </div>
  )
}
