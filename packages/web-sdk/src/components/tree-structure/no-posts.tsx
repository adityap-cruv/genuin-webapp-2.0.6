import { cn } from '@/utils'
import { ComponentProps } from 'react'

type NoPostsPropsType = ComponentProps<'div'>

export function NoPosts({ className, ...restProps }: NoPostsPropsType) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-tertiary-100 pt-2 text-title-3-bold text-tertiary',
        className,
      )}
      {...restProps}>
      No posts yet
    </div>
  )
}
