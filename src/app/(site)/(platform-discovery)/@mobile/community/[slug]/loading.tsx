import { TopBar } from '@components/layouts/mobile/top-bar'
import { Shimmer } from '@components/ui/shimmer'

export default function Loading() {
  return (
    <div>
      <TopBar />
      <div className="h-body w-full p-4">
        <div className="py-2">
          <div className="flex justify-between">
            <Shimmer className="h-20 w-20 rounded-full" />
            <div className="my-2 flex items-center gap-x-2">
              <Shimmer className="h-8 w-40" />
              <Shimmer className="h-8 w-8" />
            </div>
          </div>
          <Shimmer className="my-2 h-6 w-1/3" />
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
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-6 w-1/6" />
          <Shimmer className="h-6 w-1/6" />
        </div>
        <hr className="my-4 border-t border-monochrome-9" />
        <LoopDetailsTabs />
        <LoopDetailsTabs />
        <LoopDetailsTabs />
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
