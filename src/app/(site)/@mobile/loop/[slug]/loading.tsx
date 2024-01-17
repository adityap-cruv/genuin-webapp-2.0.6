import { TopBar } from '@components/layouts/mobile/top-bar'
import { Shimmer } from '@components/ui/shimmer'

export default function Loading() {
  return (
    <div>
      <TopBar />
      <div className="flex h-body w-full flex-col p-4">
        <div className="w-full">
          <div>
            <Shimmer className="h-6 w-1/2" />
            <Shimmer className="my-2 mt-4 h-4 w-full" />
            <Shimmer className="my-2 h-4 w-full" />
          </div>
          <div className="my-3 w-full rounded-xl border border-monochrome-9 p-4">
            <span className="flex">
              <span className="flex-1">
                <Shimmer className="h-3 w-1/3" />
                <div className="my-2 flex items-center">
                  <Shimmer className="h-8 w-8 rounded-full" />
                  <Shimmer className="ml-1 h-3 w-1/2" />
                </div>
              </span>
              <span className="flex-1">
                <Shimmer className="h-3 w-1/3" />
                <div className="my-2 flex items-center">
                  <Shimmer className="h-8 w-8 rounded-full" />
                  <Shimmer className="ml-1 h-3 w-1/2" />
                </div>
              </span>
            </span>
            <div className="my-3 flex">
              <Shimmer className="h-3 w-1/12" />
              <Shimmer className="ml-1 h-3 w-1/6" />

              <Shimmer className="ml-4 h-3 w-1/12" />
              <Shimmer className="ml-1 h-3 w-1/6" />

              <Shimmer className="ml-4 h-3 w-1/12" />
              <Shimmer className="ml-1 h-3 w-1/6" />
            </div>
          </div>

          <span className="my-2 flex items-center gap-x-3">
            <Shimmer className="h-8 w-40" />
            <Shimmer className="h-8 w-8" />
          </span>
        </div>

        <div className="mt-2 flex">
          <Shimmer className="h-4 w-1/6" />
          <Shimmer className="ml-2 h-4 w-1/4" />
          <Shimmer className="ml-2 h-4 w-1/4" />
        </div>
        <hr className="my-4 border-t border-monochrome-9" />

        <div className="grid grid-cols-2 gap-2">
          <Shimmer className="aspect-reel h-full" />
          <Shimmer className="aspect-reel h-full" />
          <Shimmer className="aspect-reel h-full" />
          <Shimmer className="aspect-reel h-full" />
        </div>
      </div>
    </div>
  )
}
