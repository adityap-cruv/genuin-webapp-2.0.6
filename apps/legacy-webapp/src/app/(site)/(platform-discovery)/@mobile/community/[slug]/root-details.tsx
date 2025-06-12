'use client'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useEffect } from 'react'
import { getCommunityDetails } from '@lib/api/community'
import { Details } from '@/components/pages/community/mobile/details'
import EmptyView from '@/components/common/empty-view'
import { NOT_FOUND_ERROR_CODES } from '@/lib/constants'
import Loader from './loading'

export function CommunityDetails({ slug }: { slug: string }) {
  const { data: communityDetails, isLoading, error } = getCommunityDetails(slug)
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

  if (isLoading) return <Loader />
  if (error) {
    if ((error as Error).message === NOT_FOUND_ERROR_CODES.community) {
      return <EmptyView type="community" />
    }
  }
  if (communityDetails) return <Details communityDetails={communityDetails} />
}
