import Image from 'next/image'
import icDollarBag from '@icons/icDollarBag.svg'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Swiper, SwiperSlide } from 'swiper/react'
import { type Swiper as SwiperType } from 'swiper/types'
import { useState } from 'react'
import { type StaticImport } from 'next/dist/shared/lib/get-img-props'
import icDiscountPercent from '@icons/icDiscountPercentage.svg'
import { VanillaPlayer } from './vanilla-player'
import { getAnimationUrlM3u8, getThumbnailUrl } from '@/lib/utils'

const networkData = [
  {
    title: 'Boost Your Existing Creator Program',
    description:
      'Genuin enables anyone to become a creator, complete quests to grow the community, and earn payouts via a built-in wallet.',
    icon: icDollarBag,
    videoUrl: getAnimationUrlM3u8('network', 'first'),
    thumbnail: getThumbnailUrl('network', 'first'),
  },
  {
    title: 'Build LTV and Advocacy',
    description:
      'Genuin transforms consumers into advocates. Use our platform to incentivize engagement, boost UGC, reward loyalty, and deepen brand affinity.',
    icon: icDiscountPercent,
    videoUrl: getAnimationUrlM3u8('network', 'second'),
    thumbnail: getThumbnailUrl('network', 'second'),
  },
]

export function Network({ timeline, mobileView }: { timeline: gsap.core.Timeline | null; mobileView: boolean }) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  useGSAP(
    () => {
      if (!timeline || !swiper) return
      timeline.to('#network', {
        scrollTrigger: {
          trigger: '#network',
          start: 'top top',
          end: '200% bottom',
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
            if (swiper.activeIndex !== swiperShouldBeIndex) {
              swiper.slideTo(swiperShouldBeIndex)
            }
          },
        },
      })
    },
    { dependencies: [timeline, swiper] }
  )

  return (
    <div
      id={!mobileView ? 'network' : undefined}
      className="container relative flex h-auto w-full flex-col items-center justify-around bg-[#FDFDFE] p-4 lg:h-screen">
      <div className="flex h-auto flex-col items-center justify-center gap-4 pt-9 lg:h-[30%] lg:pt-0">
        <p className="w-fit rounded-[30px] border-2 border-[#CAD2FE] px-4 py-[10px] text-new-para-2-mobile tracking-[0.28px] text-gray-900 md:text-new-para-1 lg:px-8 lg:py-3 lg:tracking-[0.4px]">
          ACTIVATE THE NETWORK EFFECT
        </p>
        <p className="text-center text-index-h4 leading-[110%] md:text-index-h3">
          Incentives and rewards for creators and consumers
        </p>
      </div>
      <Swiper
        id={mobileView ? 'network' : undefined}
        direction="horizontal"
        slidesPerView={1}
        allowTouchMove={false}
        speed={800}
        className="h-screen w-full lg:h-[70%]"
        onInit={(swiper) => {
          setSwiper(swiper)
        }}>
        {networkData.map((data, index) => (
          <SwiperSlide key={index} className="!flex items-center lg:!block">
            <Item
              title={data.title}
              description={data.description}
              icon={data.icon}
              videoUrl={data.videoUrl}
              poster={data.thumbnail}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

function Item({
  title,
  description,
  icon,
  videoUrl,
  poster,
}: {
  title: string
  description: string
  icon: StaticImport
  videoUrl: string
  poster: string
}) {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-16 lg:flex-row">
      <div className="flex w-full justify-start lg:w-1/2">
        <VanillaPlayer videoSource={videoUrl} loop considerViewPort shouldPlay poster={poster} />
      </div>
      <div className=" flex w-full flex-col gap-6 md:gap-9 lg:w-1/2 lg:flex-1">
        <Image src={icon} alt="scissor" className="h-6 md:h-12" />
        <p className="text-[24px] font-bold leading-[110%] lg:text-[36px]">{title}</p>
        <p className="text-[16px] font-medium leading-[140%] lg:text-[24px]">{description}</p>
      </div>
    </div>
  )
}
