'use client'
import dynamic from 'next/dynamic'
import { ExploreShimmer } from '@/components/common/shimmers/explore-shimmer'
import { useGenuinOptions } from '@lib/stores/genuin-options'

// eslint-disable-next-line @typescript-eslint/promise-function-async
const DesktopCommunities = dynamic(() => import('./components').then((comp) => comp.Communities.desktop))
// eslint-disable-next-line @typescript-eslint/promise-function-async
const MobileCommunities = dynamic(() => import('./components').then((comp) => comp.Communities.mobile))
// eslint-disable-next-line @typescript-eslint/promise-function-async
const DynamicLoops = dynamic(() => import('./components').then((comp) => comp.Loops))

export function Root({ isMobile }: { isMobile: boolean }) {
  const { isLoading } = useGenuinOptions()

  return (
    <div className="h-full overflow-auto px-6 pb-6 md:px-4">
      {isLoading ? (
        isMobile ? (
          <ExploreShimmer.mobile />
        ) : (
          <ExploreShimmer.desktop />
        )
      ) : (
        <>
          {isMobile ? <MobileCommunities /> : <DesktopCommunities />}
          <DynamicLoops />
        </>
      )}
    </div>
  )
}
