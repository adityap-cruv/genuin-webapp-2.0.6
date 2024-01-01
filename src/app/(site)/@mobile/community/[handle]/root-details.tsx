'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
const Details = dynamic(
  async () => await import('@components/pages/community/mobile/details').then((comp) => comp.ProfileDetails)
)

type Props = {
  communityDetails: CommunityDetailsType
}

export function RootDetails({ communityDetails }: Props) {
  const addCommunity = useRecentCommunitiesStore((state) => state.addCommunity)

  useEffect(() => {
    addCommunity({
      handle: communityDetails.info.handle,
      name: communityDetails.info.name,
      profileImage: communityDetails.info.profile_image,
    })
  }, [])

  return (
    <>
      <div className="absolute left-0 top-0 h-full w-full">
        <Details communityDetails={communityDetails} />
      </div>
    </>
  )
}
