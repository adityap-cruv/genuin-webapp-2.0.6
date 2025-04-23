import type { ComponentProps } from 'react'
import { cn } from '@/utils'

type NoContentPropsType = ComponentProps<'div'>

/**
 * A component to show when there is no content in feed.
 */
export function NoContent({ className, ...restProps }: NoContentPropsType) {
  return (
    <div
      className={cn(
        'flex aspect-reel h-full items-center justify-center bg-tertiary-200',
        className,
      )}
      {...restProps}>
      <p className='text-title-3-demi text-tertiary'>No activity yet</p>
    </div>
  )
}
