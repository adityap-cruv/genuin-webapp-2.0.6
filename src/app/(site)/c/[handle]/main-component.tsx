'use client'
import { CommunityDetails } from '@components/pages/community/details'
import { CommunityReels } from '@components/pages/community/reels'
import type { CommunityDetailsType } from '@lib/schemas/community-details'

interface Props {
  communityDetails: CommunityDetailsType
  isMobile?: boolean
}

export function MainComponent({ communityDetails, isMobile }: Props) {
  if (isMobile) return <Mobile communityDetails={communityDetails} />
  return <Desktop communityDetails={communityDetails} />
}

function Mobile({ communityDetails }: Props) {
  return <div>This is mobile component.</div>
}

function Desktop({ communityDetails }: Props) {
  return (
    <CommunityDetails>
      <CommunityReels communityHandle={communityDetails.info.handle} />
    </CommunityDetails>
  )
}
