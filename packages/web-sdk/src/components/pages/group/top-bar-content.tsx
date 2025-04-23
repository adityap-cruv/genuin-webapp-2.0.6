import { ComponentProps } from 'react'
import { Subscription } from './subscription'
import { cn } from '@/utils'
import ShareButton from '@/components/share-button'

type TopBarContentPropsType = {
  loopName: string
  loopId: string
  isSubscribed: boolean
  shareUrl: string
  slug: string
  name: string
} & ComponentProps<'div'>

export function TopBarContent({
  loopId,
  isSubscribed,
  loopName,
  shareUrl,
  className,
  slug,
  name,
  ...restProps
}: TopBarContentPropsType) {
  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-between',
        className,
      )}
      {...restProps}>
      <div className='flex items-center gap-x-2'>
        <p className='text-title-2-demi'>{loopName}</p>
      </div>
      <div className='my-2 hidden md:flex items-center gap-x-3'>
        <Subscription
          isSubscribed={isSubscribed}
          loopId={loopId}
          slug={slug}
          name={name}
        />
        <ShareButton url={shareUrl} />
      </div>
    </div>
  )
}
