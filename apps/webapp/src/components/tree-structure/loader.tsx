import { type ComponentProps } from 'react'
import { Shimmer } from '../ui/shimmer'
import { cn } from '@/lib/utils'

type LoaderPropsType = ComponentProps<'div'>

export function Loader({ className, ...restProps }: LoaderPropsType) {
  return (
    <div className={cn('__gen__sdk__hide__scrollbar h-full w-full overflow-auto p-4', className)} {...restProps}>
      <div className="my-4 flex items-center gap-2">
        <Shimmer className="h-11 w-11 shrink-0 rounded-full" />
        <Shimmer className="h-6 w-1/6 rounded-xl" />
      </div>
      {[...Array(5)].map((_, i) => {
        return <CommunityNodeLoader key={i} />
      })}
    </div>
  )
}

export function CommunityNodeLoader({ className, ...restProps }: LoaderPropsType) {
  return (
    <div
      className={cn('my-2 w-full rounded-lg border border-tertiary-300 bg-tertiary-100 p-4', className)}
      {...restProps}>
      <Shimmer className="h-4 w-1/5" />
      <LoopNodeLoader />
    </div>
  )
}

export function LoopNodeLoader({ className, ...restProps }: LoaderPropsType) {
  return (
    <div className={cn('my-4 grid grid-cols-8 gap-2', className)} {...restProps}>
      {Array.from({ length: 8 }).map((_, index) => {
        return <VideoNodeLoader key={index} />
      })}
    </div>
  )
}

export function VideoNodeLoader() {
  return <Shimmer className="aspect-reel w-full" />
}
