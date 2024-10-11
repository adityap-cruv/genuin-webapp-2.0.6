'use client'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useEffect } from 'react'
import { getCommunityDetails } from '@lib/api/community'
import { Details } from '@/components/pages/community/mobile/details'

export function CommunityDetails({ slug }: { slug: string }) {
  const { data: communityDetails } = getCommunityDetails(slug)
  const addCommunity = useLocalStorage((state) => state.addCommunity)

  useEffect(() => {
    if (communityDetails)
      addCommunity({
        handle: communityDetails.handle,
        name: communityDetails.name ?? '',
        profileImage: communityDetails.dp ?? '',
        slug: communityDetails.slug,
      })
  }, [communityDetails])

  if (communityDetails) return <Details communityDetails={communityDetails} />
}
