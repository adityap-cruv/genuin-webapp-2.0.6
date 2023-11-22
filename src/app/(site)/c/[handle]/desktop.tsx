import dynamic from 'next/dynamic'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { Loader } from '@components/ui/loader'
import { NavBar } from '@components/common/nav-bar'
const CommunityDetails = dynamic(
  async () => await import('@components/pages/community/details').then((comp) => comp.CommunityDetails),
  {
    loading: (_) => {
      return <Loader size="md" />
    },
  }
)
const CommunityReels = dynamic(
  async () => await import('@components/pages/community/reels').then((comp) => comp.CommunityReels),
  {
    loading: (_) => {
      return <Loader size="md" />
    },
  }
)

interface Props {
  communityDetails: CommunityDetailsType
}

export function Desktop({ communityDetails }: Props) {
  return (
    <>
      <NavBar variant="light" />
      <CommunityDetails communityDetails={communityDetails}>
        <CommunityReels communityHandle={communityDetails.info.handle} />
      </CommunityDetails>
    </>
  )
}
