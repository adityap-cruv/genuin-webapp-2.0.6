import type { CommunityDetailsType } from '@lib/schemas/community-details'

interface Props {
  communityDetails: CommunityDetailsType
}

// todo create mobile component
export function Mobile({ communityDetails }: Props) {
  return <div>This is mobile component.</div>
}
