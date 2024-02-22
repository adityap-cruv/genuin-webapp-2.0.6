import Image from 'next/image'
import { Button } from '@components/ui/button'
import { LeftScrollButtonIcon, RightScrollButtonIcon } from './horizontal-scroll-icons'
import icShare from '@icons/icShareBlue.svg'
import React, { useRef } from 'react'
import Link from 'next/link'
import { Toaster } from '@components/ui/toaster'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useInView } from 'framer-motion'
import c1 from '@images/home-page/community/communityshare 1.webp'
import c2 from '@images/home-page/community/communityshare 2.webp'
import c3 from '@images/home-page/community/communityshare 3.webp'
import c4 from '@images/home-page/community/communityshare 4.webp'
import c5 from '@images/home-page/community/communityshare 5.webp'

export function CommunitySection() {
  const communityList = [
    {
      profile_image: 'https://media.begenuin.com/webapp_assets/community/travel_hacks.png',
      name: 'Travel Hacks & Tips 👀✈️',
      description: "The best travel tips & tricks you've learned & tried… 👋🏼",
      link: 'https://begenuin.com/community/travel-hacks-tips',
    },
    {
      profile_image: 'https://media.begenuin.com/webapp_assets/community/tech_founders.png',
      name: 'Tech Founders 📈',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
      link: 'https://begenuin.com/community/tech-founders',
    },
    {
      profile_image: 'https://media.begenuin.com/webapp_assets/community/diy_lovers.png',
      name: 'DIY Lovers 🔨',
      description: 'For people who want to share DIY hacks, tips & tricks ⚒️🎨👷‍♀️',
      link: 'https://begenuin.com/community/diy-lovers',
    },
    {
      profile_image: 'https://media.begenuin.com/webapp_assets/community/flower_arranging.png',
      name: 'Flower Arranging 🌻',
      description: 'A community for people who love flower arranging — and those who want to learn 🌸🌻',
      link: 'https://begenuin.com/community/flower-arranging',
    },
  ]
  const divRef = useRef<HTMLDivElement>(null)
  const firstDivRef = useRef<HTMLDivElement>(null)
  const lastDivRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { shareFn } = useAdaptiveShare()
  const isAtFirst = useInView(firstDivRef)
  const isAtLast = useInView(lastDivRef)

  return (
    <div className="flex w-full flex-col gap-y-10">
      <div
        ref={divRef}
        className="hide-scrollbar scroll-snap-always flex snap-x gap-6 overflow-x-auto px-4 sm:px-0 sm:pl-5 lg:h-[25vh] ">
        <div ref={firstDivRef} className="w-0.5">
          &nbsp;
        </div>
        <img src={c1.src} />
        <img src={c2.src} />
        <img src={c3.src} />
        <img src={c4.src} />
        <img src={c5.src} />
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
  )
}
