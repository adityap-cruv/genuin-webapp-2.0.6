import type { CommunityDetailsType } from '@lib/schemas/community-details'

interface Props {
  communityDetails: CommunityDetailsType
}

export function MobileComponent({ communityDetails }: Props) {
  return <div>This is mobile component.</div>
}
