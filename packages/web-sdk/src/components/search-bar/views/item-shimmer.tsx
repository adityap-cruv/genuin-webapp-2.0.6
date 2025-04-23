import { Shimmer } from '@/components/ui/shimmer'
import { cn } from '@/utils'
import { ComponentProps, type ReactNode } from 'react'

type ItemShimmerType = ComponentProps<'div'> & { count?: number }

export function ItemShimmer({
  count = 4,
  className,
  ...restProps
}: ItemShimmerType) {
  const compArr: ReactNode[] = []

  for (let i = 0; i < count; i++) {
    compArr.push(
      <div
        key={i}
        className='flex w-full items-center gap-x-2'>
        <Shimmer className='h-10 w-10 rounded-full' />
        <div className='flex w-full flex-col gap-y-2'>
          <Shimmer className='h-4 w-1/4' />
          <Shimmer className='h-4 w-full pt-2' />
        </div>
      </div>,
    )
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-y-4 overflow-auto p-6',
        className,
      )}
      {...restProps}>
      {compArr}
    </div>
  )
}
