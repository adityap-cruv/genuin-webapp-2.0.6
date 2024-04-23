'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import dynamic from 'next/dynamic'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useEffect } from 'react'
import { getCommunityDetails } from '@lib/api/community'
import Loading from './loading'

const Details = dynamic(
  async () => await import('@components/pages/community/mobile/details').then((comp) => comp.Details)
)

type Props = {
  communityDetails: CommunityDetailsType
}

export function CommunityDetails({ slug }: { slug: string }) {
  const { data, isLoading } = getCommunityDetails(slug)

  if (isLoading) return <Loading />

  if (data) return <RootDetails communityDetails={data} />
}

export function RootDetails({ communityDetails }: Props) {
  const addCommunity = useLocalStorage((state) => state.addCommunity)

  useEffect(() => {
    addCommunity({
      handle: communityDetails.handle,
      name: communityDetails.name ?? '',
      profileImage: communityDetails.dp ?? '',
      slug: communityDetails.slug,
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
