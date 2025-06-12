import { Shimmer } from '@components/ui/shimmer'

export default function Loading() {
  return (
    <div className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto pl-6">
      <span className="w-1/2">
        <Shimmer className="my-5 h-5 w-1/5" />
        <Shimmer className="my-2 h-4 w-1/2" />
        <Shimmer className="my-2 h-4 w-1/2" />
        <div className="my-3 w-1/2 rounded-xl border border-monochrome-9 p-4">
          <span className="flex">
            <span className="flex-1">
              <Shimmer className="h-4 w-1/3" />
              <div className="my-2 flex items-center">
                <Shimmer className="h-8 w-8 rounded-full" />
                <Shimmer className="ml-1 h-4 w-1/2" />
              </div>
            </span>
            <span className="flex-1">
              <Shimmer className="h-4 w-1/3" />
              <div className="my-2 flex items-center">
                <Shimmer className="h-8 w-8 rounded-full" />
                <Shimmer className="ml-1 h-4 w-1/2" />
              </div>
            </span>
          </span>
          <div className="my-3 flex">
            <Shimmer className="h-4 w-1/12" />
            <Shimmer className="ml-1 h-4 w-1/6" />

            <Shimmer className="ml-4 h-4 w-1/12" />
            <Shimmer className="ml-1 h-4 w-1/6" />

            <Shimmer className="ml-4 h-4 w-1/12" />
            <Shimmer className="ml-1 h-4 w-1/6" />
          </div>
        </div>
        <span className="my-2 flex items-center gap-x-3">
          <Shimmer className="h-8 w-40" />
          <Shimmer className="h-8 w-8" />
        </span>
      </span>
      <div className="grid h-full w-full grid-cols-2 gap-4 overflow-hidden">
        <div className="h-full">
          <Shimmer className="my-4 h-4 w-1/6" />
          <div className="grid w-full grid-cols-2 gap-4">
            <Shimmer className="aspect-reel h-full" />
            <Shimmer className="aspect-reel h-full" />
            <Shimmer className="aspect-reel h-full" />
            <Shimmer className="aspect-reel h-full" />
          </div>
        </div>

        <div>
          <div>
            <Shimmer className="my-4 h-4 w-1/6" />
            <div className="flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-10/12 rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-full rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-3/5 rounded-full" />
              </div>
            </div>
          </div>
          <div>
            <Shimmer className="my-4 h-4 w-1/6" />
            <div className="flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-10/12 rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-full rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Shimmer className="h-12 w-12 shrink-0 rounded-full" />
              <div className="ml-2 w-full">
                <Shimmer className="my-1 h-4 w-1/4 rounded-full" />
                <Shimmer className="my-1 h-4 w-1/5 rounded-full" />
                <Shimmer className="my-1 h-4 w-3/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
