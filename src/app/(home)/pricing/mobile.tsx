'use client'
import React, { useEffect, useState } from 'react'
import { NavBar } from '@components/pages/build/nav-bar'
import { Button } from '@components/ui/button'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import check from '@icons/business/check.svg'
import dash from '@icons/business/dash.svg'
import content from '../../../content/pricing-page.json'
import exclamation from '@icons/business/exclamation.svg'
import Image from 'next/image'
import { Footer } from '@components/pages/build/footer'
import { ContactUs } from '@components/common/modals/contact-us'
import check_p from '@icons/icCheck.svg'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import bg from '@images/business/pricing/pricing_bg.svg'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import GetAppButton from '@/components/common/get-app-button'

SwiperCore.use([Pagination])

export default function Mobile() {
  return (
    <div className="bg-monochrome-white">
      <NavBar />
      <Component1 />
      <Component2 />
      {/* <Component3 /> */}
      <Component4 />
      <Component5 />
      <Component6 />
      <Footer />
    </div>
  )
}

function Component1() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [slideSwipe, setSlideSwipe] = useState(1)

  useEffect(() => {
    setTimeout(() => {
      setCurrentSlide(slideSwipe)
    }, 200)
  }, [slideSwipe])

  return (
    <div className="container flex flex-col items-center justify-center pb-12 pt-36">
      <p className=" text-center text-new-h1-mobile">
        A Plan for
        <br /> Everyone
      </p>

      <div className="my-2 mt-8 flex w-full justify-between px-3">
        {['Starter', 'Essential', 'Enterprise'].map((item, index) => (
          <div
            key={index}
            onClick={() => {
              setCurrentSlide(index)
            }}
            className={`flex-1 text-center text-new-para-2 ${
              currentSlide === index ? 'font-bold text-monochrome-black' : 'font-semibold text-monochrome'
            }`}>
            {item}
          </div>
        ))}
      </div>
      <div className="flex w-full justify-between px-12">
        {currentSlide === 0 ? <hr className="w-1/6 border-b-2 border-primary" /> : <div />}
        {currentSlide === 1 ? <hr className="w-1/6 border-b-2 border-primary" /> : <div />}
        {currentSlide === 2 ? <hr className="w-1/6 border-b-2 border-primary" /> : <div />}
      </div>
      <hr className="border-b-1 w-full border-monochrome-9" />

      <div className="my-4 w-full">
        <Swiper
          key={currentSlide}
          modules={[Pagination]}
          onSlideChange={(swiper) => {
            setSlideSwipe(swiper.realIndex)
          }}
          className="mySwiper relative w-full"
          initialSlide={currentSlide}>
          <Image priority loading="eager" className="absolute h-full w-screen" src={bg} alt="bg" />

          <SwiperSlide>
            {' '}
            <div className="m-6 min-h-[525px] rounded-xl bg-monochrome-white p-8">
              <p className="my-1 text-new-h2-mobile font-semibold">Starter</p>
              <p className="text-new-sm">For Emerging Communities</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h3">
                  $39<span className="text-new-md">/month</span>
                </p>
                <GetAppButton
                  buttonText="Get Started"
                  className="mt-8 bg-new-off-black px-12 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic community tools enough you get you started</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Basic moderation tools to keep community safe</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">1,000 MaU included with additional MaUs at $0.10/MaU</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile text-red">Genuin watermark</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative m-6 min-h-[525px] rounded-xl bg-monochrome-white p-8">
              <div
                className="absolute rounded-full px-4 py-1.5 text-center text-body-1-demi text-monochrome-white"
                style={{
                  backgroundImage: 'linear-gradient(89deg, #4E78FE 1.08%, #959DF9 97.55%)',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}>
                MOST POPULAR
              </div>
              <p className="my-1 text-new-h2-mobile font-semibold">Essential</p>
              <p className="text-new-sm">For Established Communities</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h3">
                  $299<span className="text-new-md">/month</span>
                </p>
                <a href={process.env.NEXT_PUBLIC_BCC_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="custom"
                    className="mt-8 bg-new-off-black px-12 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-para-2">Get Started</p>
                  </Button>
                </a>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-new-md">
                  Everything in <span className="text-title-2-demi">Starter</span> , plus
                </p>{' '}
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">AI content generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">AI moderation</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">10,000 MaU included with additional MaUs at $0.5/MaU</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={exclamation} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile text-red">Genuin watermark</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative m-6 min-h-[525px] rounded-xl bg-monochrome-white p-8">
              <p className="my-1 text-new-h2-mobile font-semibold">Enterprise</p>
              <p className="text-new-sm">For Enterprises</p>
              <div className="flex flex-col items-center py-16">
                <p className="text-center text-new-h3">
                  $1999<span className="text-new-md">/month</span>
                </p>
                <ContactUs>
                  <Button
                    size="custom"
                    className="mt-8 bg-new-off-black px-12 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
                    <p className="text-new-para-2">Contact Us</p>
                  </Button>
                </ContactUs>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-new-md">
                  Everything in <span className="text-title-2-demi">Essential</span> , plus
                </p>{' '}
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Managed service</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Full white label capability with your URL</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Data in your own warehouse</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Advanced analytics tools and insights</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">AI assistance to engage and grow your audience</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">1M MaU included with additional MaUs at $0.01/MaU</p>
                </div>
                <div className="flex items-center gap-2">
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
                  <p className="text-new-para-2-mobile">Genuin watermark is removed</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  )
}

function Component2() {
  return (
    <div>
      <p className="mb-10 text-center text-new-h1-mobile">Compare All Plan Features</p>
      <div className="bg-white sticky top-0 z-10">
        <div className="grid grid-cols-3 bg-[#ADDAFF] px-4 py-4">
          <div className="flex justify-center text-cap-1-bold">Starter</div>
          <div className="flex justify-center text-cap-1-bold">Essential</div>
          <div className="flex justify-center text-cap-1-bold">Enterprise</div>
        </div>
      </div>
      <div className="mt-6 ">
        {content.table.tableData.map((row, index) => (
          <div key={index} className="m-4 rounded-lg border border-monochrome-9">
            <div className="grid grid-cols-3 ">
              <div className="flex justify-center border border-monochrome-9 p-2">
                {row.starter ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
              <div className="flex justify-center border border-monochrome-9 p-2">
                {row.essential ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
              <div className="flex justify-center rounded-tr-lg border border-monochrome-9 p-2">
                {row.enterprise ? (
                  <Image priority loading="eager" src={check} width={24} height={24} alt="Check" />
                ) : (
                  <Image priority loading="eager" src={dash} width={24} height={24} alt="Check" />
                )}
              </div>
            </div>
            <p className="rounded-b-lg bg-monochrome-white py-2 pl-4 text-cap-1-bold">{row.category}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// function Component3() {
//   return (
//     <div className="container mt-20">
//       <p className="my-10 text-center text-new-h1-mobile">Pro Plan</p>
//       <p className="my-4 text-new-h2-mobile">Want a fully customized plan for your goals?</p>
//       <p className="my-4 text-new-sm">With pro plan, you’ll get the white label capabilities with your own URL.</p>
//       <ContactUs>
//         <Button size="custom" className="my-2 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
//           <p className="text-new-para-2">Contact us for pricing</p>
//         </Button>
//       </ContactUs>
//       <div className="mt my-4 rounded-2xl bg-[#F7F1F9] p-6">
//         <p className="mb-8 text-new-h4">What do you get from a pro plan?</p>
//         <div className="flex items-center gap-2">
//           <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
//           <p className="text-new-sm">Advanced analytics tools and insights</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Image priority loading="eager" src={check} width={24} height={24} alt="Star" />
//           <p className="text-new-sm">AI tools</p>
//         </div>
//       </div>
//     </div>
//   )
// }

function Component4() {
  const features = [
    'Full white label capability with your URL',
    'Data in your own warehouse',
    'Advanced analytics tools and insights',
    'AI moderation and management tools',
    'AI assistance to engage and grow your audience',
  ]
  return (
    <div className="container mt-20">
      <p className="my-10 text-center text-new-h1-mobile">Enterprise Plan</p>
      <p className="my-4 text-new-h2-mobile">
        Are you a big enterprise that need A fully customized community solution?
      </p>
      <p className="my-4 text-new-sm">With enterprise plan, Genuin will curate a solution for you.</p>
      <ContactUs>
        <Button size="custom" className="my-2 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
          <p className="text-new-para-2">Contact us for demo and pricing</p>
        </Button>
      </ContactUs>
      <div className="mt-8 flex flex-col justify-center gap-4">
        {features.map((item, index) => (
          <div key={index} className="flex h-20 items-center gap-6 rounded-2xl bg-[#F7F1F9] p-6">
            <img src={check_p.src} alt="genuin" className="h-10 w-10" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Component5() {
  return (
    <div className="container mt-20">
      <div className="mt my-4 rounded-2xl bg-[#E9CAF4] p-6">
        <p className="mb-4 text-new-h1-mobile">Not sure which plan is right for you?</p>
        <p className="mb-4 text-new-sm">
          Contact us for support - we can help you find the plan that works best for you and your community. Contact us
          to get started!
        </p>
        <ContactUs>
          <Button
            size="custom"
            className="my-2 bg-new-off-black px-5 py-3 after:bg-new-dark-grey hover:bg-new-dark-grey">
            <p className="text-new-para-2">Book Demo</p>
          </Button>
        </ContactUs>
      </div>
    </div>
  )
}

function Component6() {
  return (
    <div className="mt-20 flex h-40 flex-col items-center justify-center gap-4 bg-monochrome-9 ">
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
