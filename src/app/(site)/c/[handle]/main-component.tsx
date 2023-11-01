'use client'

import type { CommunityDetailsType } from '@lib/schemas/community'
import dynamic from 'next/dynamic'
const MobileComponent = dynamic(() => import('./mobile').then((comp) => comp.Mobile))
const DesktopComponent = dynamic(() => import('./desktop').then((comp) => comp.Desktop))

interface Props {
  communityDetails: CommunityDetailsType
  isMobile?: boolean
}

export function MainComponent({ communityDetails, isMobile }: Props) {
  // if (isMobile) return <MobileComponent communityDetails={communityDetails} />
  return <DesktopComponent communityDetails={communityDetails} />
}
