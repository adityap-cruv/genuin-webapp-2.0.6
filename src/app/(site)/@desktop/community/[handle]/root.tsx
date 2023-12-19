'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'
import { useEffect } from 'react'

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

  return <div>Creating community details...</div>
}
