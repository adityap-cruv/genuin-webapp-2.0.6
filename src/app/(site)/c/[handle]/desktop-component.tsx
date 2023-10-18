import { CommunityDetails } from '@components/pages/community/details'
import { CommunityReels } from '@components/pages/community/reels'
import type { CommunityDetailsType } from '@lib/schemas/community-details'

interface Props {
  communityDetails: CommunityDetailsType
}

export function DesktopComponent({ communityDetails }: Props) {
  return (
    <CommunityDetails communityDetails={communityDetails}>
      <CommunityReels communityHandle={communityDetails.info.handle} />
    </CommunityDetails>
  )
}
