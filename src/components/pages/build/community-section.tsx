import { Button } from '@components/ui/button'
import { LeftScrollButtonIcon, RightScrollButtonIcon } from './horizontal-scroll-icons'
import React, { useRef } from 'react'
import Link from 'next/link'
import { useInView } from 'framer-motion'
import c1 from '@images/home-page/community/community-share-1.webp'
import c2 from '@images/home-page/community/community-share-2.webp'
import c3 from '@images/home-page/community/community-share-3.webp'
import c4 from '@images/home-page/community/community-share-4.webp'
import c5 from '@images/home-page/community/community-share-5.webp'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@components/ui/carousel'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function CommunitySection() {
  const { isMobile } = useGenuinOptions((state) => ({ isMobile: state.isMobile }))
  const communityList = [
    {
      image: c1,
      link: 'https://begenuin.com/community/meaningful-love-gifts',
    },
    {
      image: c2,
      link: 'https://begenuin.com/community/flawless-makeup-secrets',
    },
    {
      image: c3,
      link: 'https://begenuin.com/community/knowledge-sharing-talks',
    },
    {
      image: c4,
      link: 'https://begenuin.com/community/home-improvement-community',
    },
    {
      image: c5,
      link: 'https://begenuin.com/community/vibrant-creative-community',
    },
  ]
  const divRef = useRef<HTMLDivElement>(null)
  const firstDivRef = useRef<HTMLDivElement>(null)
  const lastDivRef = useRef<HTMLDivElement>(null)
  const isAtFirst = useInView(firstDivRef)
  const isAtLast = useInView(lastDivRef)

  return (
    <>
      {isMobile ? (
        <Carousel className="mb-20 w-full max-w-sm">
          <CarouselContent>
            {communityList.map((item, index) => {
              return (
                <CarouselItem key={index}>
                  <div>
                    <Link href={item.link}>
                      <img src={item.image.src} className="lg:h-[25vh]" alt="genuin" />
                    </Link>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <div className="absolute -bottom-14 right-14">
            <CarouselNext />
          </div>
          <div className="absolute -bottom-14 left-14">
            <CarouselPrevious />
          </div>
        </Carousel>
      ) : (
        <div className="flex w-full flex-col gap-y-10">
          <div
            ref={divRef}
            className="hide-scrollbar scroll-snap-always flex snap-x overflow-x-auto px-4 sm:px-0 sm:pl-5 ">
            <div ref={firstDivRef} className="w-0.5">
              &nbsp;
            </div>
            {communityList.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <div
                    className={`m-4 box-border flex min-w-full snap-center flex-col gap-y-1 rounded-3xl shadow-md hover:cursor-pointer sm:min-w-max sm:max-w-md`}>
                    <Link href={item.link}>
                      <img src={item.image.src} className="lg:h-[25vh]" alt="genuin" />
                    </Link>
                  </div>
                </React.Fragment>
              )
            })}
            <div ref={lastDivRef} className="w-0.5">
              &nbsp;
            </div>
          </div>
          <div className="flex justify-between px-3">
            <Button
              disabled={isAtFirst}
              variant="outline"
              className="border-none"
              onClick={(e) => {
                const div = divRef.current
                if (!div) return
                div.scrollBy({ left: -div.getBoundingClientRect().width, behavior: 'smooth' })
              }}>
              <LeftScrollButtonIcon disabled={isAtFirst} />
            </Button>
            <Button
              disabled={isAtLast}
              variant="outline"
              className="border-none"
              onClick={(e) => {
                const div = divRef.current
                if (!div) return
                div.scrollBy({ left: div.getBoundingClientRect().width, behavior: 'smooth' })
              }}>
              <RightScrollButtonIcon disabled={isAtLast} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
