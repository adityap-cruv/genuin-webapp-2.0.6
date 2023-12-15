import dynamic from 'next/dynamic'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { Loader } from '@components/ui/loader'
const CommunityDetails = dynamic(
  async () => await import('@components/pages/community/details').then((comp) => comp.CommunityDetails),
  {
    loading: (_) => {
      return <Loader size="md" />
    },
  }
)

interface Props {
  communityDetails: CommunityDetailsType
}

export function Root({ communityDetails }: Props) {
  return <CommunityDetails communityDetails={communityDetails} />
}
