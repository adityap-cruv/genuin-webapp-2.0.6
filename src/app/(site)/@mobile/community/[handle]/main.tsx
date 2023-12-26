'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import dynamic from 'next/dynamic'
const Details = dynamic(
  async () => await import('@components/pages/community/mobile/details').then((comp) => comp.ProfileDetails)
)

type Props = {
  communityDetails: CommunityDetailsType
  showDetails: boolean
}

export default function Main({ communityDetails }: Props) {
  return (
    <>
      <div className="absolute left-0 top-0 h-full w-full">
        <Details communityDetails={communityDetails} />
      </div>
    </>
  )
}
