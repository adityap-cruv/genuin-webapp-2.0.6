import { CommunityDetails } from '@genuin/components/page/community-details/community-details'

interface Props {
  slug: string
}

export function CommunityClientPage({ slug }: Props) {
  return <CommunityDetails slug={slug} />
}
