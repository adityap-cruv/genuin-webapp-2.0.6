import { cn } from '@/lib/utils'
import { LoopCardShimmer } from '@components/common/loop-card'
import { Shimmer } from '@components/ui/shimmer'
import { type ComponentProps } from 'react'

export function CommunityCardShimmer({ className, ...restProps }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative w-full rounded-lg border border-monochrome-9 bg-monochrome-white', className)}
      {...restProps}>
      <div className="flex">
        <div className="w-[10%] items-center p-[3%]">
          <Shimmer className="h-8 w-8 rounded-full" />
        </div>
        <div className="w-[60%] items-center p-[3%]">
          <Shimmer className="h-4 w-2/3" />
          <div className="my-1 flex gap-2">
            <Shimmer className="h-4 w-1/2" />
          </div>
        </div>
        <div className="w-[30%] items-center pt-2">
          <Shimmer className="h-8 w-4/5" />
        </div>
      </div>

      <div className="h-[30%] p-4 pt-2">
        <Shimmer className="w-100 my-1 h-3" />
        <Shimmer className="my-1 h-3 w-2/3" />
      </div>
    </div>
  )
}

export function ExploreShimmer() {
  return (
    <>
      <div className="my-6 grid h-full w-full grid-cols-1 gap-4 overflow-hidden sm:hidden">
        <div>
          <CommunityCardShimmer />
          <LoopCardShimmer />
          <LoopCardShimmer />
          <LoopCardShimmer />
        </div>
      </div>
      <div className="hide-scrollbar absolute inset-0 hidden h-full w-full overflow-auto px-6 sm:block">
        <div className="my-6 grid h-full w-full grid-cols-2 gap-4 overflow-hidden">
          <div>
            <CommunityCardShimmer />
            <CommunityCardShimmer />
            <LoopCardShimmer />
            <LoopCardShimmer />
          </div>

          <div className="snap-y snap-proximity overflow-auto overflow-x-hidden scroll-smooth">
            <div>
              <CommunityCardShimmer />
              <CommunityCardShimmer />
              <LoopCardShimmer />
              <LoopCardShimmer />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
