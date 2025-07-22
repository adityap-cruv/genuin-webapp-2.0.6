'use client'
import { CommunityDetails } from '@genuin/components/page/community-details/community-details'

interface Props {
  slug: string
  isFeed: boolean
}

export function CommunityClientPage({ slug, isFeed }: Props) {
  return <CommunityDetails slug={slug} isFeed={isFeed} />
}
