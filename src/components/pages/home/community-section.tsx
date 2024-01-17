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
      <div ref={divRef} className="hide-scrollbar scroll-snap-always flex snap-x overflow-x-auto px-4 sm:px-0 sm:pl-5 ">
        <div ref={firstDivRef} style={{ width: '2px' }}>
          &nbsp;
        </div>
        {communityList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <div
                onClick={() => (window.location.href = item.link)}
                style={{ WebkitBoxSizing: 'border-box' }}
                className={`m-4 box-border flex min-w-full snap-center flex-col gap-y-1 rounded-[20px] border-2 border-transparent p-6 outline outline-1 outline-new-light-grey hover:border-2 hover:border-primary hover:shadow-md hover:outline-0 sm:min-w-max sm:max-w-md`}>
                <div className="flex w-full justify-between">
                  <CustomAvatar
                    className="h-20 w-20 rounded-full bg-red-40"
                    imageUrl={item.profile_image}
                    isAvatar={false}
                    fallbackString={item.name}
                  />
                  <div className="flex items-center gap-x-2">
                    <Link href={item.link}>
                      <Button size="sm" className="px-4">
                        <p className="text-title-3-bold">Join</p>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      outlineColor="genuin-blue"
                      size="sm"
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        await shareFn({
                          title: 'Share this community.',
                          description: 'Welcome to Genuin!!',
                          shareLink: item.link,
                          toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                        })
                      }}>
                      <Image src={icShare} alt="share" />
                    </Button>
                    <Toaster />
                  </div>
                </div>
                <p className="mt-2 line-clamp-1 text-title-3-bold">{item.name}</p>
                <p className="line-clamp-2 text-title-3-demi sm:max-w-xs">{item.description}</p>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={lastDivRef} style={{ width: '2px' }}>
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
