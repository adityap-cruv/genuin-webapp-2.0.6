import { cn } from '@/lib/utils'
import { Shimmer } from '@components/ui/shimmer'
import { type ComponentProps } from 'react'

const TRANSFORM_VALUES = [[50], [48, 52], [46, 50, 54]]

const RIGHT_VALUES = [[20], [24, 16], [28, 20, 12]]

const OPACITY_VALUES = [[1], [1, 0.5], [1, 0.66, 0.4]]

export function Loader({ className, ...restProps }: ComponentProps<'div'>) {
  const items = [0, 1, 2]
  return (
    <div className={cn('border-tertiary-200 relative h-60 w-full rounded-lg border', className)} {...restProps}>
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
      {items.map((_, index) => (
        <Shimmer
          key={index}
          className="group/video aspect-reel absolute top-[50%] flex h-[80%] items-center justify-center rounded hover:cursor-pointer"
          style={{
            right: `${RIGHT_VALUES[items.length - 1]?.[index] ?? 20}px`,
            transform: `translateY(-${TRANSFORM_VALUES[items.length - 1]?.[index] ?? 50}%)`,
            zIndex: items.length - index + 1,
            opacity: `${OPACITY_VALUES[items.length - 1]?.[index] ?? 1}`,
          }}
        />
      ))}
    </div>
  )
}
