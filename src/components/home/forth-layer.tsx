import React, { useEffect, useState, type ComponentProps } from 'react'
import { useGSAP } from '@gsap/react'
import { type Swiper as SwiperType } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { getAnimationUrlM3u8, getThumbnailUrl, cn } from '@/lib/utils'
import Image from 'next/image'
import { Mousewheel } from 'swiper/modules'
import { VanillaPlayer } from './vanilla-player'
// import { cn } from '@/lib/utils'
import gsap from 'gsap'
import { type StaticImageData } from 'next/image'
// import icCommunityGrey from '@icons/icCommunityGrey.svg'
// import icProfile from '@icons/icProfile.svg'
import imgEmbedSecondStage from '@images/embedSecondStage.png'
// import icShoppingCartGrey from '@icons/icShoppingCartGrey.svg'
import imgRevenueUp from '@images/revenueup.gif'
import imgEmbedElementSide from '@images/embedElementSide.png'
import imgEmbedThirdStage from '@images/embedElementhirdStage.png'
// import icHome from '@icons/icHome.svg'
// import icCart from '@icons/icCart.svg'
import imgEmbedElementBg from '@images/embedElementBg.svg'
import icShoppingBasket from '@icons/icShoppingBasket.svg'
import icMediaPlaylist from '@icons/icMediaPlaylist.svg'
import icPhoneCamera from '@icons/icPhoneCamera.svg'
import icOrganicCommunity from '@icons/icOrganicCommunity.svg'
import icLeftHandSidedArrow from '@icons/icLeftHandSidedArrow.svg'
import icDoubleSidedArrow from '@icons/icDoubleSidedArrow.svg'
import icShoppingCart from '@icons/icShoppingCart.svg'

const embedTicks = [
  {
    title: (
      <>
        Your
        <br /> Content
      </>
    ),
    icon: icShoppingCart,
    doubleSideArrow: false,
  },
  {
    title: (
      <>
        Consumer
        <br /> Brands
      </>
    ),
    doubleSideArrow: false,
    icon: icShoppingBasket,
  },
  {
    title: (
      <>
        Media
        <br /> Partners
      </>
    ),
    doubleSideArrow: true,
    icon: icMediaPlaylist,
  },
  {
    title: (
      <>
        Creators
        <br /> Community
      </>
    ),
    icon: icPhoneCamera,
    doubleSideArrow: true,
  },
  {
    title: (
      <>
        Organic
        <br /> Community
      </>
    ),
    icon: icOrganicCommunity,
    doubleSideArrow: false,
  },
]

const sectionData = [
  {
    title: (
      <>
        Community <br />
        Media Network
      </>
    ),
    topSubHeading: 'INTRODUCING OUR',
    description: (
      <>
        that connects brands,
        <br /> creators, and consumers
      </>
    ),
  },
  {
    title: (
      <>
        to drive <br />
        engagement
      </>
    ),
    description: (
      <>
        with your branded content,
        <br /> partners, and community
      </>
    ),
  },
  {
    title: (
      <>
        and unlock <br />
        media revenue
      </>
    ),
    description: (
      <>
        to reclaim ownership of your
        <br /> consumer relationships.
      </>
    ),
  },
]

const slides = [
  { videoUrl: getAnimationUrlM3u8('embed', 'first'), thumbnail: getThumbnailUrl('embed', 'first') },
  { videoUrl: getAnimationUrlM3u8('embed', 'second'), thumbnail: getThumbnailUrl('embed', 'second') },
  { videoUrl: getAnimationUrlM3u8('embed', 'third'), thumbnail: getThumbnailUrl('embed', 'third') },
  { videoUrl: getAnimationUrlM3u8('embed', 'forth'), thumbnail: getThumbnailUrl('embed', 'forth') },
  { videoUrl: getAnimationUrlM3u8('embed', 'fifth'), thumbnail: getThumbnailUrl('embed', 'fifth') },
]

type ForthLayerForMobilePropsType = Omit<ComponentProps<'div'>, 'title'> & {
  timeline: gsap.core.Timeline | null
}

export function ForthLayerForMobile({ className, style, timeline, ...restProps }: ForthLayerForMobilePropsType) {
  const [embedSwiper, setEmbedSwiper] = React.useState<SwiperType | null>(null)
  const [sideSwiper, setSideSwiper] = React.useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [swiperSize, setSwiperSize] = React.useState<{ height: number; width: number } | undefined>(undefined)
  const [mobileView, setMobileView] = useState(false)

  useEffect(() => {
    let width = window.innerWidth * 0.4
    width = width > 325 ? 325 : width
    const height = width * 2
    function handleResize() {
      setSwiperSize({ height, width })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useGSAP(
    () => {
      if (!sideSwiper) return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#forth-layer',
          start: 'top top',
          end: '300% top',
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const swiperShouldBeIndex = gsap.utils.mapRange(
              0.25,
              0.75,
              0,
              2,
              gsap.utils.snap([0.25, 0.5, 0.75], self.progress)
            )
            if (sideSwiper?.activeIndex !== swiperShouldBeIndex) {
              sideSwiper?.slideTo(swiperShouldBeIndex)
            }
          },
        },
      })

      sideSwiper.on('slideChange', (swiper) => {
        if (swiper.previousIndex === 0) {
          gsap.to('.embed-first-stage', {
            opacity: 0,
          })
        }
        if (swiper.previousIndex === 1) {
          gsap.to('.embed-second-stage', {
            opacity: 0,
            scale: 1,
          })
        }
        if (swiper.previousIndex === 2) {
          gsap.to('.embed-third-stage', {
            opacity: 0,
          })
        }

        if (swiper.activeIndex === 0) {
          gsap.to('.embed-first-stage', {
            opacity: 1,
          })
        }

        if (swiper.activeIndex === 1) {
          gsap.to('.embed-second-stage', {
            opacity: 1,
            scale: 2.2,
          })
        }

        if (swiper.activeIndex === 2) {
          gsap.to('.embed-third-stage', {
            opacity: 1,
          })
        }
      })

      const matchMedia = gsap.matchMedia()
      matchMedia.add('(min-width: 768px)', () => {
        setMobileView(false)
      })
      matchMedia.add('(max-width: 767px)', () => {
        setMobileView(true)
      })
    },
    { dependencies: [sideSwiper] }
  )

  return (
    <div className={cn('relative h-screen', className)} style={{ backgroundColor: '#3727C8', ...style }} {...restProps}>
      <div className="flex h-full flex-col items-center justify-center gap-6 ">
        <div id="embed-image" className="relative">
          <Image loading="lazy" className="embed-first-stage h-min w-full" src={imgEmbedElementBg} alt="bg" />
          {swiperSize && (
            <div className="!absolute -bottom-5 left-1/2 -translate-x-1/2" style={{ ...swiperSize }}>
              <Swiper
                onActiveIndexChange={(swiper) => {
                  setActiveIndex(swiper.activeIndex)
                }}
                id="embed-swiper"
                initialSlide={activeIndex}
                allowTouchMove={false}
                onInit={(swiper) => {
                  setEmbedSwiper(swiper)
                }}
                speed={700}
                style={{ borderRadius: '20px' }}
                className="h-full overflow-clip"
                slidesPerView={1}
                direction="vertical"
                mousewheel>
                {slides.map((slide, index) => {
                  return (
                    <SwiperSlide className="h-full w-full" key={index}>
                      <div className="flex h-full w-full items-center justify-center bg-monochrome-3">
                        <VanillaPlayer
                          className="h-full w-full object-cover"
                          poster={slide.thumbnail}
                          videoSource={slide.videoUrl}
                          considerViewPort={false}
                          shouldPlay={activeIndex === index}
                          loop
                        />
                      </div>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
              <div className="embed-first-stage absolute right-0 top-0 flex h-full translate-x-full flex-col justify-around">
                {embedTicks.map((tick, index) => {
                  return (
                    <EmbedTicks
                      mobileView={mobileView}
                      key={index}
                      title={tick.title}
                      icon={tick.icon}
                      isActive={index === activeIndex}
                      doubleSidedArrow={tick.doubleSideArrow}
                      onClick={
                        embedSwiper
                          ? (e) => {
                              embedSwiper?.slideTo(index)
                            }
                          : undefined
                      }
                    />
                  )
                })}
              </div>
              <Image
                loading="lazy"
                src={imgEmbedElementSide}
                alt="side"
                className="embed-first-stage absolute bottom-4 h-auto w-1/2  -translate-x-full"
              />
              <Image
                src={imgEmbedSecondStage}
                alt="second stage"
                className="embed-second-stage absolute inset-0 left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0"
              />
              <Image
                src={imgEmbedThirdStage}
                alt="genuin"
                className="embed-third-stage absolute bottom-0 w-2/3 -translate-x-[90%] opacity-0"
              />
              <Image
                src={imgRevenueUp}
                alt="revenue-up"
                className="embed-third-stage absolute top-0 z-10 -translate-x-[20%] -translate-y-[20%] opacity-0"
              />
            </div>
          )}
        </div>
        <Swiper
          speed={800}
          direction={'horizontal'}
          className="w-full"
          onInit={(swiper) => {
            setSideSwiper(swiper)
          }}>
          {sectionData.map((section, index) => {
            return (
              <SwiperSlide key={index} className="!flex flex-col justify-center px-5 pt-5 text-white">
                <div className="flex flex-col items-center gap-2  pb-2 lg:items-start lg:gap-4 lg:pb-12">
                  {section.topSubHeading && (
                    <p className="text-center text-[14px] font-medium tracking-[1.4px] lg:text-start lg:text-[24px] lg:tracking-[2.4px]">
                      {section.topSubHeading}
                    </p>
                  )}
                  <p className="text-center text-[30px] font-medium leading-none lg:text-start lg:text-[64px]">
                    {section.title}
                  </p>
                </div>
                <p className="text-center text-[16px] font-semibold lg:text-start lg:text-[34px]">
                  {section.description}
                </p>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </div>
  )
}

type ForthLayerPropsType = Omit<ComponentProps<'div'>, 'title'> & {
  timeline: gsap.core.Timeline | null
  mobileView: boolean
}

export function ForthLayer({ className, timeline, ...restProps }: ForthLayerPropsType) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [embedSwiper, setEmbedSwiper] = React.useState<SwiperType | null>(null)
  const [sideSwiper, setSideSwiper] = React.useState<SwiperType | null>(null)

  useGSAP(
    () => {
      if (!timeline || !sideSwiper) return
      const matchMedia = gsap.matchMedia()

      matchMedia.add('(min-width: 1074px)', () => {
        timeline
          .to('.embed-second-stage', {
            opacity: 1,
            scale: 0.8,
            onStart: () => {
              sideSwiper.slideTo(1)
            },
            onReverseComplete: () => {
              sideSwiper.slideTo(0)
            },
          })
          .to('.embed-second-stage', { opacity: 0 })
          .to('.embed-third-stage', {
            opacity: 1,
            onStart: () => {
              sideSwiper.slideTo(2)
            },
            onReverseComplete: () => {
              sideSwiper.slideTo(1)
            },
          })
      })
    },
    { dependencies: [sideSwiper, timeline] }
  )

  // const tabBar = [
  //   { icon: icHome, name: 'Home' },
  //   { icon: icCart, name: 'Wish list' },
  //   { icon: icShoppingCartGrey, name: 'Cart' },
  //   { icon: icCommunityGrey, name: 'Community' },
  //   { icon: icProfile, name: 'Profile' },
  // ]

  return (
    <div className={cn('inset-0 -z-10 w-full items-center', className)} {...restProps}>
      <div className="embed-background absolute inset-0 h-screen opacity-0" style={{ backgroundColor: '#3727C8' }} />
      <div className="relative flex h-full w-full flex-col items-center gap-10 pt-10 lg:flex-row lg:pt-0">
        <div id="embed-element-background" className="relative h-1/2 w-full lg:h-auto lg:w-auto">
          <Image
            loading="lazy"
            className="embed-background embed-first-stage opacity-0"
            src={imgEmbedElementBg}
            alt="bg"
            fill
          />
          <div
            id="embed-element"
            style={{ top: '18%', left: '50%', transform: 'translate(-50%, 0)' }}
            className="absolute aspect-[9/16]">
            <Image
              loading="lazy"
              src={imgEmbedElementSide}
              alt="side"
              className="embed-background embed-first-stage absolute inset-0 h-auto w-3/4 -translate-x-full opacity-0 "
            />
            <Swiper
              onActiveIndexChange={(swiper) => {
                setActiveIndex(swiper.activeIndex)
              }}
              id="embed-swiper"
              initialSlide={activeIndex}
              modules={[Mousewheel]}
              onInit={(swiper) => {
                setEmbedSwiper(swiper)
              }}
              speed={700}
              style={{ borderRadius: '20px' }}
              className="embed-background absolute inset-0 -z-10 h-full w-full overflow-clip opacity-0"
              slidesPerView={1}
              direction="vertical"
              mousewheel>
              {slides.map((slide, index) => {
                return (
                  <SwiperSlide className="h-full w-full" key={index}>
                    <div className="flex h-full w-full items-center justify-center bg-monochrome-3">
                      <VanillaPlayer
                        className="h-full w-full object-cover"
                        poster={slide.thumbnail}
                        videoSource={slide.videoUrl}
                        considerViewPort={false}
                        shouldPlay={activeIndex === index}
                        loop
                      />
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
            {/* <div
              className="bottom-0 absolute embed-background w-full opacity-1 flex justify-around items-center bg-black py-2"
              style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', zIndex: 2 }}>
              {tabBar.map((tab, index) => {
                return (
                  <div key={index} className="flex flex-col gap-1 items-center justify-center">
                    <Image src={tab.icon} className="lg:w-10 w-2" alt="tab" />
                    <p className="text-[6px] font-extrabold text-white">{tab.name}</p>
                  </div>
                )
              })}
            </div> */}
            <Image
              src={imgRevenueUp}
              alt="revenue-up"
              className="embed-third-stage absolute top-0 z-10 -translate-x-[20%] -translate-y-[20%] opacity-0"
            />
            <Image
              src={imgEmbedThirdStage}
              alt="genuin"
              className="embed-third-stage absolute bottom-0 w-2/3 -translate-x-[90%] opacity-0"
            />
            <div className="embed-background embed-first-stage absolute inset-0 flex h-full translate-x-full flex-col justify-around opacity-0">
              {embedTicks.map((tick, index) => {
                return (
                  <EmbedTicks
                    mobileView={false}
                    key={index}
                    title={tick.title}
                    icon={tick.icon}
                    isActive={index === activeIndex}
                    doubleSidedArrow={tick.doubleSideArrow}
                    onClick={
                      embedSwiper
                        ? (e) => {
                            embedSwiper?.slideTo(index)
                          }
                        : undefined
                    }
                  />
                )
              })}
            </div>
          </div>
          <Image
            src={imgEmbedSecondStage}
            alt="second stage"
            className="embed-second-stage absolute inset-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0"
          />
        </div>
        <div className="embed-background flex h-1/2 w-full items-center justify-center text-white opacity-0 lg:h-full lg:w-auto">
          <Swiper
            speed={800}
            className="h-1/2 lg:h-full"
            direction={'vertical'}
            onInit={(swiper) => {
              setSideSwiper(swiper)
            }}>
            {sectionData.map((section, index) => {
              return (
                <SwiperSlide key={index} className="!flex flex-col justify-center px-5">
                  <div className="flex flex-col items-center gap-2  pb-2 lg:items-start lg:gap-4 lg:pb-12">
                    {section.topSubHeading && (
                      <p className="text-center text-[14px] font-medium tracking-[1.4px] lg:text-start lg:text-[24px] lg:tracking-[2.4px]">
                        {section.topSubHeading}
                      </p>
                    )}
                    <p className="text-center text-[30px] font-medium leading-none lg:text-start lg:text-[64px]">
                      {section.title}
                    </p>
                  </div>
                  <p className="text-center text-[16px] font-semibold lg:text-start lg:text-[34px]">
                    {section.description}
                  </p>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>
    </div>
  )
}

type EmbedElementPropsType = Omit<ComponentProps<'div'>, 'title'> & {
  title: React.ReactNode
  icon: StaticImageData
  isActive: boolean
  doubleSidedArrow?: boolean
  mobileView: boolean
}

function EmbedTicks({
  className,
  title,
  icon,
  doubleSidedArrow,
  isActive,
  mobileView,
  ...restProps
}: EmbedElementPropsType) {
  return (
    <div className={cn('group flex w-fit cursor-pointer', className)} {...restProps}>
      <div className="flex flex-col items-center justify-center lg:justify-start">
        <p
          className={cn(
            'hidden text-center text-white opacity-0 transition-opacity duration-1000 group-hover:opacity-100 md:block',
            isActive && 'opacity-100'
          )}
          style={{ fontSize: 12, fontWeight: 800 }}>
          {title}
        </p>
        <Image
          src={doubleSidedArrow ? icDoubleSidedArrow : icLeftHandSidedArrow}
          alt="arrow"
          className={cn(
            'opacity-0 transition-opacity  duration-1000 group-hover:opacity-100',
            isActive && 'opacity-100'
          )}
          width={mobileView ? 55 : 110}
        />
      </div>
      <div
        className={cn(
          'translate-y-2 rounded-lg p-0.5 opacity-20 transition-opacity duration-1000 group-hover:opacity-100',
          isActive && 'opacity-100'
        )}
        style={{ background: 'linear-gradient(#9395FF, #1685FD)' }}>
        <div
          className="rounded-lg bg-white p-3"
          style={{
            borderRadius: '8px',
          }}>
          <Image height={mobileView ? 12 : 36} width={mobileView ? 12 : 36} alt="cart" src={icon} />
        </div>
      </div>
    </div>
  )
}
