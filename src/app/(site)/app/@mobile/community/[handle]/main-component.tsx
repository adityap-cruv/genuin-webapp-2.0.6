'use client'
import type { CommunityDetailsType } from '@lib/schemas/community'
import dynamic from 'next/dynamic'
const Mobile = dynamic(async () => await import('./mobile').then((comp) => comp.Mobile))
const Desktop = dynamic(async () => await import('./desktop').then((comp) => comp.Desktop))

interface Props {
  communityDetails: CommunityDetailsType
  isMobile?: boolean
  /**
   * This variable is used by mobile component if details is true then
   * community details page will be sent to user or else it will send details page.
   * @default false
   */
  showDetailsPage?: boolean
}

export function MainComponent({ communityDetails, isMobile, showDetailsPage = false }: Props) {
  if (isMobile) return <Mobile communityDetails={communityDetails} showDetails={showDetailsPage} />
  return <Desktop communityDetails={communityDetails} />
}
