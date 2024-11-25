'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Loops } from './components'
import dynamic from 'next/dynamic'

const DesktopCommunities = dynamic(async () => await import('./components').then((comp) => comp.Communities.desktop))
const MobileCommunities = dynamic(async () => await import('./components').then((comp) => comp.Communities.mobile))

export function Root() {
  const isMobile = useGenuinOptions().isMobile
  return (
    <div className="h-full overflow-auto px-6 pb-6 md:px-4">
      {isMobile ? <MobileCommunities /> : <DesktopCommunities />}
      <Loops />
    </div>
  )
}
