import { LoopCardShimmer } from '@components/common/loop-card'
import { Shimmer } from '@components/ui/shimmer'

export default function Loading() {
  return (
    <div className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto px-6">
      <div className="pt-6">
        <Shimmer className="h-20 w-20 rounded-full" />
        <span className="flex items-center gap-x-2 py-2">
          <Shimmer className="h-6 w-1/5 rounded-xl" />
          <Shimmer className="h-4 w-1/12" />
        </span>
        <Shimmer className="my-1 h-4 w-1/2" />
        <Shimmer className="my-1 h-4 w-1/2" />

        <div className="my-3 flex w-1/2">
          <Shimmer className="h-4 w-1/12" />
          <Shimmer className="ml-1 h-4 w-1/6" />

          <Shimmer className="ml-4 h-4 w-1/12" />
          <Shimmer className="ml-1 h-4 w-1/6" />

          <Shimmer className="ml-4 h-4 w-1/12" />
          <Shimmer className="ml-1 h-4 w-1/6" />
        </div>
        <span className="my-2 flex items-center gap-x-3">
          <Shimmer className="h-8 w-40" />
          <Shimmer className="h-8 w-8" />
        </span>
      </div>
      <div className="my-6 grid h-full w-full grid-cols-2 gap-4 overflow-hidden">
        <div>
          <div className="flex gap-2">
            <Shimmer className="h-4 w-1/6" />
            <Shimmer className="h-4 w-1/6" />
          </div>
          <hr className="my-4 border-t border-monochrome-9" />
          <LoopCardShimmer />
          <LoopCardShimmer />
        </div>

        <div className="snap-y snap-proximity overflow-auto overflow-x-hidden scroll-smooth">
          <div>
            <Shimmer className="h-6 w-1/5 rounded-xl" />
            <div className="my-2 flex gap-2">
              <Shimmer className="h-8 w-1/5 rounded-2xl" />
              <Shimmer className="h-8 w-1/4 rounded-2xl" />
              <Shimmer className="h-8 w-1/4 rounded-2xl" />
              <Shimmer className="h-8 w-1/4 rounded-2xl" />
            </div>
            <Shimmer className="h-8 w-1/3 rounded-2xl" />
          </div>

          <div className="my-4">
            <Shimmer className="h-6 w-1/12 rounded-xl" />
            <div className="my-2 flex gap-2">
              <Shimmer className="h-8 w-8" />
              <Shimmer className="h-8 w-8" />
              <Shimmer className="h-8 w-1/3" />
            </div>
          </div>

          <div className="my-4">
            <Shimmer className="h-6 w-1/5 rounded-xl" />
            <Shimmer className="my-2 h-4 w-1/2 rounded-xl" />
            <Shimmer className="my-2 h-4 w-1/3 rounded-xl" />
            <Shimmer className="my-2 h-4 w-3/5 rounded-xl" />
          </div>

          <div className="my-4">
            <Shimmer className="h-6 w-1/12 rounded-xl" />
            <div className="my-2 flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
