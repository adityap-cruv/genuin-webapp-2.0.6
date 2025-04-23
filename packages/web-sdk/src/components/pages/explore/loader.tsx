import { Loader as LoopCardShimmer } from '@/components/loop-card'
import { Shimmer } from '@/components/ui/shimmer'
import { cn } from '@/utils'
import { type ComponentProps } from 'react'

export function Loader() {
  return (
    <div className='py-4 grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full overflow-auto px-6'>
      <CommunitiesLoader />
      <LoopsLoader />
    </div>
  )
}

export function CommunitiesLoader() {
  return (
    <>
      <CommunityCardShimmer />
      <CommunityCardShimmer className='hidden md:block' />
      <CommunityCardShimmer className='hidden md:block' />
      <CommunityCardShimmer className='hidden md:block' />
    </>
  )
}

export function LoopsLoader() {
  return (
    <>
      <LoopCardShimmer />
      <LoopCardShimmer />
      <LoopCardShimmer />
      <LoopCardShimmer />
    </>
  )
}

function CommunityCardShimmer({
  className,
  ...restProps
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border border-monochrome-9 bg-monochrome-white',
        className,
      )}
      {...restProps}>
      <div className='flex'>
        <div className='w-[10%] items-center p-[3%]'>
          <Shimmer className='h-8 w-8 rounded-full' />
        </div>
        <div className='w-[60%] items-center p-[3%]'>
          <Shimmer className='h-4 w-2/3' />
          <div className='my-1 flex gap-2'>
            <Shimmer className='h-4 w-1/2' />
          </div>
        </div>
        <div className='w-[30%] items-center pt-2'>
          <Shimmer className='h-8 w-4/5' />
        </div>
      </div>

      <div className='h-[30%] p-4 pt-2'>
        <Shimmer className='w-100 my-1 h-3' />
        <Shimmer className='my-1 h-3 w-2/3' />
      </div>
    </div>
  )
}
