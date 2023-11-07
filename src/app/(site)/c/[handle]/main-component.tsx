'use client'

import type { CommunityDetailsType } from '@lib/schemas/community'
import dynamic from 'next/dynamic'
const Mobile = dynamic(() => import('./mobile').then((comp) => comp.Mobile))
const Desktop = dynamic(() => import('./desktop').then((comp) => comp.Desktop))

interface Props {
  communityDetails: CommunityDetailsType
  isMobile?: boolean
}

export function MainComponent({ communityDetails, isMobile }: Props) {
  if (isMobile) return <Mobile communityDetails={communityDetails} />
  return <Desktop communityDetails={communityDetails} />
}
