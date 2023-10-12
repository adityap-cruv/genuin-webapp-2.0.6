'use client'

import type { CommunityDetailsType } from '@lib/schemas/community-details'
import dynamic from 'next/dynamic'
const MobileComponent = dynamic(() => import('./mobile-component').then((comp) => comp.MobileComponent))
const DesktopComponent = dynamic(() => import('./desktop-component').then((comp) => comp.DesktopComponent))

interface Props {
  communityDetails: CommunityDetailsType
  isMobile?: boolean
}

export function MainComponent({ communityDetails, isMobile }: Props) {
  if (isMobile) return <MobileComponent communityDetails={communityDetails} />
  return <DesktopComponent communityDetails={communityDetails} />
}
