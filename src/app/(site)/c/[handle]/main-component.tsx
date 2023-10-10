'use client'

import { CommunityDetails } from '@components/pages/community/details'
import { CommunityReels } from '@components/pages/community/reels'

export function MainComponent({ communityData = null }: { communityData: any }) {
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
