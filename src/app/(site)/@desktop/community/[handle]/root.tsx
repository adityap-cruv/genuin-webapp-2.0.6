'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import { RootDetails } from './root-details'
import { RootFeed } from './root-feed'

interface Props {
  communityDetails: CommunityDetailsType
  showFeed: boolean
}

export function Root({ communityDetails, showFeed }: Props) {
  if (showFeed) return <RootFeed communityDetails={communityDetails} />
  return <RootDetails communityDetails={communityDetails} />
}
