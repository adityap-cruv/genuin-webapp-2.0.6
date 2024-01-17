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
          <LoopDetailsTabs />
          <LoopDetailsTabs />
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

function LoopDetailsTabs() {
  const videos = [1, 2, 3]
  const videosLength = videos.length
  const transformValues: any = {
    1: [50],
    2: [48, 52],
    3: [46, 50, 54],
  }

  const rightValues: any = {
    1: [20],
    2: [24, 16],
    3: [28, 20, 12],
  }

  const opacitValues: any = {
    1: [1],
    2: [1, 0.5],
    3: [1, 0.66, 0.4],
  }

  return (
    <div className="relative">
      <div className="relative my-4 w-full rounded-lg border border-monochrome-9 bg-monochrome-white">
        <div className="w-[70%] items-center p-[3%]">
          <Shimmer className="h-4 w-2/3" />
          <div className="my-1 flex gap-2">
            <Shimmer className="h-4 w-1/2" />
            <Shimmer className="h-4 w-1/12" />
          </div>
        </div>
        <div className="h-[60%] p-4">
          <div className="flex w-[70%] items-center">
            <div className="relative flex">
              <Shimmer className="z-20 h-6 w-6 rounded-full" />
              <Shimmer className="absolute left-3 z-10 h-6 w-6 rounded-full" />
              <Shimmer className="absolute left-6 h-6 w-6 rounded-full" />
            </div>
            <Shimmer className="ml-7 h-3 w-1/2" />
          </div>
          <Shimmer className="my-1 h-3 w-2/3" />
          <Shimmer className="my-1 h-3 w-2/3" />
          <div className="my-2 flex gap-2">
            <Shimmer className="h-3 w-1/5" />
            <Shimmer className="h-3 w-1/6" />
          </div>
        </div>
      </div>
      {videos.map((item: any, index: number) => (
        <Shimmer
          key={index}
          className="group/video absolute top-[50%] flex aspect-reel h-[80%] items-center justify-center rounded hover:cursor-pointer"
          style={{
            right: `${rightValues[videosLength][index]}px`,
            transform: `translateY(-${transformValues[videosLength][index]}%)`,
            zIndex: videosLength - index + 1,
            opacity: `${opacitValues[videosLength][index]}`,
          }}></Shimmer>
      ))}
    </div>
  )
}
