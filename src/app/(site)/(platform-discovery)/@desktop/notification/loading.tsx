'use client'
import { Shimmer } from '@components/ui/shimmer'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export default function Loading() {
  const isMobile = useGenuinOptions().isMobile
  return (
    <div className={`h-full w-full ${!isMobile && 'p-6'} sm:w-1/2`}>
      {!isMobile && <Shimmer className="h-8 w-2/3" />}
      <div className="my-4 flex flex-col gap-2">
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-12 w-full" />
      </div>
    </div>
  )
}
