import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import { LeftScrollButtonIcon, RightScrollButtonIcon } from './horizontal-scroll-icons'
import icShare from '@icons/icShareBlue.svg'
import React from 'react'
import { useRef } from 'react'
import { getAvatarFallback } from '@lib/utils'

export function CommunitySection() {
  const communityList = [
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
    {
      profile_image:
        'https://media.qa.begenuin.com/uploads/thumbnails/l/192A0DCA-4BE6-4FBE-88AF-49C367DFF904_1652961525111.png',
      name: 'techfounders',
      description: 'A space for tech founders to come together & discuss founder life 🎢',
    },
  ]
  const divRef = useRef<HTMLDivElement>(null)

  return (
    <div className="mt-5 flex w-full flex-col gap-y-4 sm:px-5">
      <div ref={divRef} className="hide-scrollbar flex gap-x-4 overflow-x-auto sm:pl-5 ">
        {communityList.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <div className="flex min-w-full flex-col gap-y-1 rounded-md border-2 border-monochrome-7 p-3 sm:w-1/4 sm:min-w-max sm:max-w-xs">
                <div className="flex w-full justify-between">
                  <Avatar className="h-20 w-20 rounded-full bg-red-40">
                    <AvatarImage src={item.profile_image} className="object-cover" />
                    <AvatarFallback>
                      <p className="text-title-xl text-monochrome-white">{getAvatarFallback(item.name)}</p>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-x-2">
                    <Button size="sm">
                      <p className="text-title-md">Join</p>
                    </Button>
                    <Button variant="outline" outlineColor="genuin-blue" className="border-2" size="sm">
                      <Image src={icShare} alt="share" />
                    </Button>
                  </div>
                </div>
                <p className="line-clamp-1  text-title-md">{item.name}</p>
                <p className="line-clamp-2 text-body-lg sm:max-w-xs">{item.description}</p>
              </div>
            </React.Fragment>
          )
        })}
      </div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          className="border-none"
          onClick={(e) => {
            const div = divRef.current
            if (!div) return
            div.scrollBy({ left: -div.getBoundingClientRect().width, behavior: 'smooth' })
          }}>
          <LeftScrollButtonIcon disabled={false} />
        </Button>
        <Button
          variant="outline"
          className="border-none"
          onClick={(e) => {
            const div = divRef.current
            if (!div) return
            div.scrollBy({ left: div.getBoundingClientRect().width, behavior: 'smooth' })
          }}>
          <RightScrollButtonIcon disabled={false} />
        </Button>
      </div>
    </div>
  )
}
