'use client'
import { CommunityDetails } from '@components/pages/community/details'
import { CommunityReels } from '@components/pages/community/reels'
import type { CommunityDetailsType } from '@lib/schemas/community-details'

export function MainComponent({ communityData }: { communityData: CommunityDetailsType }) {
  console.log('communityData::', communityData)
  if (communityData)
    return (
      <div className="flex justify-between">
        <CommunityDetails.left />
        <CommunityReels communityHandle={communityData.info.handle} />
        <CommunityDetails.right />
      </div>
    )
}
