'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
const Details = dynamic(
  async () => await import('@components/pages/community/mobile/details').then((comp) => comp.ProfileDetails)
)
const ReelsNavbar = dynamic(
  async () => await import('@components/pages/community/mobile/nav-bar').then((comp) => comp.NavBar.reels)
)
const CommunityReels = dynamic(
  async () => await import('@components/pages/community/mobile/reels').then((comp) => comp.CommunityReels),
  {
    loading(loadingProps) {
      return <Loader size="lg" />
    },
  }
)

interface Props {
  communityDetails: CommunityDetailsType
  showDetails: boolean
}

export function Mobile({ communityDetails, showDetails }: Props) {
  if (showDetails) {
    return <Details communityDetails={communityDetails} />
  }

  return (
    <>
      <div className="absolute left-0 top-0 h-full w-full">
        <ReelsNavbar communityDetails={communityDetails} />
        <div className="h-full w-full">
          <CommunityReels communityHandle={communityDetails.info.handle} />
        </div>
      </div>
    </>
  )
}
