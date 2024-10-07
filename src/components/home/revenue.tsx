'use client'
import { SwiperSlide, Swiper } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useState } from 'react'
import { getAnimationUrlM3u8, getThumbnailUrl } from '@/lib/utils'
import { VanillaPlayer } from './vanilla-player'
import { type Swiper as SwiperType } from 'swiper/types'
import './custom.css'
import icNoPoverty from '@icons/icNoPoverty.svg'
import icPlaylistWhite from '@icons/icPlaylistWhite.svg'
import icTrophyWhite from '@icons/icTrophyWhite.svg'
import imgRevenueImage1 from '@images/revenueImages/revenueImages1.png'
import imgRevenueImage3 from '@images/revenueImages/revenueImages3.png'
import imgRevenueImage4 from '@images/revenueImages/revenueImages4.png'
import imgRevenueImage6 from '@images/revenueImages/revenueImages6.png'
import imgRevenueImage7 from '@images/revenueImages/revenueImages7.png'
import imgRevenueImage9 from '@images/revenueImages/revenueImages9.png'

const revenueData = [
  { image: imgRevenueImage1 },
  {
    videoUrl: getAnimationUrlM3u8('revenue', 'first'),
    title: 'Community Sponsorships',
    // description:
    //   'Genuin creates exclusive access to brand partners in the community: premium takeovers, category and topic placements, and keywords.',
    description:
      'Offer exclusive access to brand partners within the community: premium takeovers, category and topic placements, and keywords.',
    icon: icNoPoverty,
    thumbnail: getThumbnailUrl('revenue', 'first'),
  },
  { image: imgRevenueImage3 },
  { image: imgRevenueImage4 },
  {
    videoUrl: getAnimationUrlM3u8('revenue', 'second'),
    title: 'Vertical Video Ads',
    // description: 'Genuin integrates a wide range of standard ad formats into community video feeds.',
    description:
      'Integrate a variety of standard ad formats directly into community video feeds for seamless monetization.',
    icon: icPlaylistWhite,
    thumbnail: getThumbnailUrl('revenue', 'second'),
  },
  { image: imgRevenueImage6 },
  { image: imgRevenueImage7 },
  {
    videoUrl: getAnimationUrlM3u8('revenue', 'third'),
    title: 'Branded Campaigns',
    // description:
    //   'Genuin enables the extension of all social creatives into your community, such as #challenges, Q&A, and polls.',
    description:
      'Extend social creative into your community with engaging formats like #challenges, Q&A sessions, and interactive polls.',
    icon: icTrophyWhite,
    thumbnail: getThumbnailUrl('revenue', 'third'),
  },
  { image: imgRevenueImage9 },
]

export function Revenue({ timeline, mobileView }: { timeline: gsap.core.Timeline | null; mobileView: boolean }) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [secondSwiper, setSecondSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useGSAP(
    () => {
      if (!timeline || !swiper || !secondSwiper) return

      timeline.to('#revenue', {
        scrollTrigger: {
          trigger: '#revenue',
          start: 'top top',
          end: '300% top',
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const swiperShouldBeIndex = gsap.utils.mapRange(
              0.25,
              0.75,
              1,
              7,
              gsap.utils.snap([0.25, 0.5, 0.75], self.progress)
            )
            if (swiper.activeIndex !== swiperShouldBeIndex) {
              swiper.slideTo(swiperShouldBeIndex)
            }
            const secondSwiperShouldBeIndex = gsap.utils.mapRange(
              0.25,
              0.75,
              0,
              2,
              gsap.utils.snap([0.25, 0.5, 0.75], self.progress)
            )
            if (secondSwiper.activeIndex !== secondSwiperShouldBeIndex) {
              secondSwiper.slideTo(secondSwiperShouldBeIndex)
            }
          },
        },
      })

      const matchMedia = gsap.matchMedia()

      matchMedia.add('(min-width: 1074px)', () => {
        gsap.set('.video-slide', { height: window.innerHeight * 0.5, width: (window.innerHeight * 0.5 * 9) / 16 })
      })

      matchMedia.add('(max-width: 1073px)', () => {
        gsap.set('.video-slide', { height: (window.innerWidth * 0.5 * 16) / 9, width: window.innerWidth * 0.5 })
      })
    },
    { dependencies: [timeline, swiper, secondSwiper] }
  )

  return (
    <div
      id={!mobileView ? 'revenue' : undefined}
      className="relative h-auto lg:flex lg:h-screen lg:items-center"
      style={{ backgroundColor: '#090A1B' }}>
      <div className="relative flex w-full flex-col items-center justify-center lg:gap-12">
        <div className="flex flex-col items-center gap-4 pt-9 lg:gap-6 lg:py-5 lg:pt-0">
          <p
            className="rounded-full border-2 px-4 py-[10px] text-[14px] tracking-[0.28px] text-white lg:px-8 lg:py-3 lg:text-[22px] lg:tracking-[0.4px] "
            style={{ borderColor: '#495057' }}>
            GENERATE NEW REVENUE
          </p>
          <div className="flex flex-col gap-4 px-5 lg:gap-6 lg:px-0">
            <p className="text-center text-[30px] font-medium leading-[110%] text-white lg:text-[48px]">
              3 Ways to Maximize High-Margin Monetization
            </p>
            <p className="text-center text-[16px] font-semibold text-white lg:text-[24px]">
              Create new media revenue with endless, community-powered videos.
            </p>
          </div>
        </div>
        <div
          id={mobileView ? 'revenue' : undefined}
          className="flex h-screen w-full flex-col-reverse items-center justify-center gap-9 lg:h-auto lg:flex-row lg:gap-0">
          <Swiper
            onInit={(swiper) => {
              setSecondSwiper(swiper)
            }}
            slidesPerView={1}
            centeredSlides
            initialSlide={0}
            speed={800}
            className="w-full lg:h-full lg:flex-1"
            style={{ margin: 0 }}
            direction="horizontal">
            {revenueData.map((data, index) => {
              if (data.image) return undefined
              return (
                <SwiperSlide key={index} className="!flex h-full items-center justify-center px-6">
                  <div className="flex max-w-lg flex-col gap-6 lg:gap-9">
                    <Image src={data.icon} height={48} width={48} alt="genuin" className="hidden lg:block" />
                    <p className="text-center text-[24px]  font-bold text-white lg:text-start lg:text-[36px]">
                      {data.title}
                    </p>
                    <p className="max-w-lg text-center text-[16px] font-medium leading-[140%] text-white lg:text-start lg:text-[24px]">
                      {data.description}
                    </p>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
          <Swiper
            onInit={(swiper) => {
              setSwiper(swiper)
            }}
            initialSlide={1}
            slidesPerView={'auto'}
            allowTouchMove={false}
            modules={[EffectCoverflow]}
            className="w-full lg:w-full lg:flex-1"
            effect="coverflow"
            centeredSlides
            speed={800}
            onActiveIndexChange={(swiper) => {
              secondSwiper?.slideTo(swiper.activeIndex)
              setActiveIndex(swiper.activeIndex)
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: mobileView ? 30 : -30,
              depth: mobileView ? 50 : 100,
              modifier: 1,
              scale: 0.8,
            }}
            direction="horizontal">
            {revenueData.map((data, index) => {
              if (data.image) {
                return (
                  <SwiperSlide key={index} className="video-slide">
                    <Image src={data.image} alt="image" style={{ aspectRatio: 9 / 16 }} />
                  </SwiperSlide>
                )
              }
              return (
                <SwiperSlide key={index} className="video-slide">
                  <div className="flex h-full w-full items-center justify-center">
                    <VanillaPlayer
                      poster={data.thumbnail}
                      considerViewPort={false}
                      videoSource={data.videoUrl}
                      shouldPlay={activeIndex === index}
                      className="h-full"
                      style={{ aspectRatio: 9 / 16 }}
                      loop
                    />
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
