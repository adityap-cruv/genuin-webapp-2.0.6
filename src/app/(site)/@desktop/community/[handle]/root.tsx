'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'
import { useEffect, useRef } from 'react'

interface Props {
  communityDetails: CommunityDetailsType
}

export function Root({ communityDetails }: Props) {
  const addCommunity = useRecentCommunitiesStore((state) => state.addCommunity)
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    addCommunity({
      handle: communityDetails.info.handle,
      name: communityDetails.info.name,
      profileImage: communityDetails.info.profile_image,
    })
  }, [])

  return (
    <nav ref={navRef} className="z-1 sticky top-0 h-10 w-full -translate-y-full bg-red transition-all animate-in"></nav>
  )
}
