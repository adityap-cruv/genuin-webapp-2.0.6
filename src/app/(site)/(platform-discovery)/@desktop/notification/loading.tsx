import { Shimmer } from '@components/ui/shimmer'

export default function Loading() {
  return (
    <div className="w-1/2 p-6">
      <Shimmer className="h-8 w-2/3" />
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
