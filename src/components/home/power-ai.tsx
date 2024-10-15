import Image from 'next/image'
import { useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Swiper, SwiperSlide } from 'swiper/react'
// import { Thumb } from '@radix-ui/react-slider'
import { type Swiper as SwiperType } from 'swiper/types'
import icScissor from '@icons/icScissor.svg'
import icFilmSlate from '@icons/icFilmSlate.svg'
import icUserSync from '@icons/icUserSync.svg'
import { VanillaPlayer } from './vanilla-player'
import icLiveVideo from '@icons/icLiveVideoBlack.svg'
import { getAnimationUrlM3u8, getThumbnailUrl } from '@/lib/utils'
import CustomButton from '../custom/custom-button'
import Link from 'next/link'
// import { BCC_LOGIN_LINK } from '@/lib/const'
import { BCC_LOGIN_LINK } from '@/lib/constants'

const powerOfAIData = [
  {
    title: 'Clip and Convert',
    description:
      'Turn longer videos into short clips. Our AI reframes any video to a vertical 9:16 ratio, detecting speakers and moving objects to create optimal viral clips.',
    icon: icScissor,
    videoUrl: getAnimationUrlM3u8('power-ai', 'first'),
    thumbnail: getThumbnailUrl('power-ai', 'first'),
  },
  {
    title: 'Repurpose Content',
    description:
      'Aggregate your branded content from all sources.Our AI fetches social and royalty- free content from the web that is relevant to your community.',
    icon: icFilmSlate,
    videoUrl: getAnimationUrlM3u8('power-ai', 'second'),
    thumbnail: getThumbnailUrl('power-ai', 'second'),
  },
  {
    title: 'Feed Curation and Personalization',
    description:
      'Our AI curates branded videos using categories, topics, and keywords, while community interactions and user-selected interests personalize the feed.',
    icon: icUserSync,
    videoUrl: getAnimationUrlM3u8('power-ai', 'third'),
    thumbnail: getThumbnailUrl('power-ai', 'third'),
  },
  {
    icon: icLiveVideo,
    title: 'Enhanced Moderation ',
    description:
      'Generative moderation powered by a fleet of AI agents ensures consistency based on your brand, community, and Genuin  guidelines.',
    videoUrl: getAnimationUrlM3u8('power-ai', 'forth'),
    thumbnail: getThumbnailUrl('power-ai', 'forth'),
  },
]

export function PowerAI({ timeline, mobileView }: { timeline: gsap.core.Timeline | null; mobileView: boolean }) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  useGSAP(
    () => {
      if (!timeline || !swiper) return
      timeline.to('#power-ai', {
        scrollTrigger: {
          trigger: '#power-ai',
          start: 'top top',
          end: '400% top',
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const swiperShouldBeIndex = gsap.utils.mapRange(
              0.25,
              1,
              0,
              3,
              gsap.utils.snap([0.25, 0.5, 0.75, 1], self.progress)
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
    <div id={!mobileView ? 'power-ai' : undefined} className="relative w-full bg-[#E6ECFF]">
      <div className="container flex h-auto w-full flex-col gap-4 lg:h-screen">
        <div className="flex flex-col items-center justify-center gap-4 pt-9 lg:h-[30%] lg:py-0 lg:pt-0">
          <p className="w-fit rounded-[30px] border-2 border-[#CAD2FE] px-4 py-[10px] text-new-para-2-mobile tracking-[0.28px] text-gray-900 md:px-6 md:py-4 md:text-new-para-1 lg:px-8 lg:py-3 lg:tracking-[0.4px]">
            HARNESS THE POWER OF AI
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-index-h4 font-medium leading-[110%] lg:text-index-h3">
              Autonomous engagement and content curation
            </p>
            <p className="text-center text-cap-1-home-m font-semibold lg:text-start lg:text-body-2-demi-home">
              AI-curated content aggregation - from all sources.
            </p>
          </div>
        </div>
        <div id={mobileView ? 'power-ai' : undefined} className="flex h-screen w-full items-center lg:block lg:h-[70%]">
          <Swiper
            direction="horizontal"
            slidesPerView={1}
            allowTouchMove={false}
            speed={800}
            className="w-full"
            onInit={(swiper) => {
              setSwiper(swiper)
            }}>
            {powerOfAIData.map((data, index) => (
              <SwiperSlide key={index}>
                <div className="flex w-full flex-col-reverse items-center gap-12 lg:flex-row">
                  <div className="flex w-full flex-1 flex-col gap-6 md:gap-9 lg:w-1/2">
                    <Image src={data.icon} alt="scissor" className="h-6 md:h-12" />
                    <p className="text-body-2-bold-home md:text-title-2-bold-home-m lg:text-title-2-bold-home-m ">
                      {data.title}
                    </p>
                    <p className="text-cap-1-home-m md:text-title-1-med lg:text-body-2-demi-home">{data.description}</p>
                    <Link href={BCC_LOGIN_LINK} target="_blank" rel="noopener noreferrer">
                      <CustomButton
                        variant="custom"
                        className="hidden border border-gray-900 px-5 py-4 text-cap-1-bold-home transition-all hover:border-white md:text-index-h5-extra-bold lg:block"
                        radius="rounded-[36px]"
                        showIcon>
                        Try it out
                      </CustomButton>
                    </Link>
                  </div>
                  <div className="flex w-full justify-end lg:w-1/2">
                    <VanillaPlayer
                      className="rounded-[18px] lg:rounded-[35px]"
                      considerViewPort
                      shouldPlay
                      videoSource={data.videoUrl}
                      loop
                      poster={data.thumbnail}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
