'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'
import { useEffect, useRef } from 'react'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { TopBar } from './top-bar'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useInView } from 'framer-motion'

interface Props {
  communityDetails: CommunityDetailsType
}

export function Root({ communityDetails }: Props) {
  const addCommunity = useRecentCommunitiesStore((state) => state.addCommunity)
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })

  useEffect(() => {
    addCommunity({
      handle: communityDetails.info.handle,
      name: communityDetails.info.name,
      profileImage: communityDetails.info.profile_image,
    })
  }, [])

  return (
    <>
      <TopBar
        defaultOpen={false}
        isOpen={!detailsInView}
        communityName={communityDetails.info.name}
        communityProfileImage={communityDetails.info.profile_image}
        communtiyHandle={communityDetails.info.handle}
      />
      <main className="absolute inset-0 h-full w-full overflow-auto pl-6 ">
        <div ref={detailsDivRef} className="pt-6">
          <CustomAvatar
            isAvatar={false}
            imageUrl={communityDetails.info.profile_image}
            fallbackString={communityDetails.info.name}
            className="h-20 w-20"
          />
          <p className="py-2 text-title-xl">{communityDetails.info.name}</p>
          <Stats communityDetails={communityDetails} />
          <p className="line-clamp-2 w-1/2 break-all pb-4 pt-2">{communityDetails.info.description}</p>
          <span className="flex gap-x-2">
            <Button size="custom">
              <p className="px-4 py-2 text-body-sm">Join Community</p>
            </Button>
            <Button variant="outline" size="custom" className="border-2 border-primary p-0.5">
              <Image src={icShare} alt="share" className="h-6 w-6" />
            </Button>
          </span>
        </div>
        <div className="flex h-full w-full">
          <div className="h-[200%] flex-1 bg-red"></div>
          <div className="sticky top-0 h-full flex-1 bg-blue"></div>
        </div>
      </main>
    </>
  )
}

function Stats({ communityDetails }: { communityDetails: CommunityDetailsType }) {
  return (
    <div className="flex items-center">
      <span className="px-1">
        <span className="text-title-md text-monochrome-black">{communityDetails?.info.count.member}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetails?.info.count.member === 1 ? 'Member' : 'Members'}
        </span>
      </span>
      <span className="px-1">
        <span className="text-title-md text-monochrome-black">{communityDetails?.info.count.loop}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetails?.info.count.loop === 1 ? 'Loop' : 'Loops'}
        </span>
      </span>
      <span className="px-1">
        <span className="text-title-md text-monochrome-black">{communityDetails?.info.count.video}</span>
        <span className="text-cap-lg text-secondary">
          &nbsp;{communityDetails?.info.count.video === 1 ? 'Video' : 'Videos'}
        </span>
      </span>
    </div>
  )
}
