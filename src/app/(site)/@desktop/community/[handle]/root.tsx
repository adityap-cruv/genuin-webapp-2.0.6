'use client'
import dynamic from 'next/dynamic'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { Loader } from '@components/ui/loader'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'
import { useEffect } from 'react'
const CommunityDetails = dynamic(
  async () => await import('@components/pages/community/details').then((comp) => comp.CommunityDetails),
  {
    loading: (_) => {
      return <Loader size="md" />
    },
  }
)

interface Props {
  communityDetails: CommunityDetailsType
}

export function Root({ communityDetails }: Props) {
  const addCommunity = useRecentCommunitiesStore((state) => state.addCommunity)
  useEffect(() => {
    addCommunity({
      handle: communityDetails.info.handle,
      name: communityDetails.info.name,
      profileImage: communityDetails.info.profile_image,
    })
  }, [])

  return <CommunityDetails communityDetails={communityDetails} />
}
