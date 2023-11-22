'use client'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import dynamic from 'next/dynamic'
const Mobile = dynamic(async () => await import('./mobile').then((comp) => comp.Mobile))
const Desktop = dynamic(async () => await import('./desktop').then((comp) => comp.Desktop))
interface Props {
  loopDetails: LoopDetailsType
  isMobile: any
}

// todo work on this when api gets updated.
// todo optimize this page load.
export function MainComponent({ loopDetails, isMobile }: Props) {
  if (isMobile) return <Mobile loopDetails={loopDetails} />
  return <Desktop loopDetails={loopDetails} />
}
