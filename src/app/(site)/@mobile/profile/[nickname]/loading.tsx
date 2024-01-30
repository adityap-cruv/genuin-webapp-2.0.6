import { TopBar } from '@components/layouts/mobile/top-bar'
import { Shimmer } from '@components/ui/shimmer'

export default function Loading() {
  return (
    <div>
      <TopBar variant={'light'} />
      <div className="h-body w-full">
        <div className="w-full p-4">
          <Shimmer className="h-20 w-20 rounded-full" />
          <div className="flex items-center gap-2 py-2">
            <Shimmer className="h-6 w-1/4 rounded-xl" />
            <Shimmer className="h-4 w-1/6" />
          </div>
          <Shimmer className="my-1 h-4 w-full" />
          <Shimmer className="my-1 h-4 w-full" />

          <div className="my-3 flex w-full">
            <Shimmer className="h-4 w-1/12" />
            <Shimmer className="ml-1 h-4 w-1/6" />

            <Shimmer className="ml-4 h-4 w-1/12" />
            <Shimmer className="ml-1 h-4 w-1/6" />

            <Shimmer className="ml-4 h-4 w-1/12" />
            <Shimmer className="ml-1 h-4 w-1/6" />
          </div>

          <Shimmer className="h-8 w-8" />
          <hr className="my-1 border-t border-monochrome-9" />

          <div className="flex items-center justify-between">
            <div className="my-4 flex items-center gap-2">
              <Shimmer className="h-11 w-11 shrink-0 rounded-full" />
              <Shimmer className="h-4 w-20 rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="h-8 w-14" />
              <Shimmer className="h-8 w-8" />
            </div>
          </div>

          <div className="bg-monochrome-11 w-full rounded-lg border border-monochrome-9 p-4">
            <Shimmer className="h-4 w-1/5" />
            <div className="my-4 grid grid-cols-3 gap-2">
              <Shimmer className="aspect-reel w-full" />
              <Shimmer className="aspect-reel w-full" />
              <Shimmer className="aspect-reel w-full" />
            </div>
          </div>

          <div className="bg-monochrome-11 my-2 w-full rounded-lg border border-monochrome-9 p-4">
            <Shimmer className="h-4 w-1/5" />
            <div className="my-4 grid grid-cols-3 gap-2">
              <Shimmer className="aspect-reel w-full" />
              <Shimmer className="aspect-reel w-full" />
              <Shimmer className="aspect-reel w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
