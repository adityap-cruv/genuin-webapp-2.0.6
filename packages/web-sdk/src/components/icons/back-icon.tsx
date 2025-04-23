import { cn } from '@/utils'
import { type ComponentProps } from 'react'

type BackIconPropsType = ComponentProps<'svg'>

export function BackIcon({ className, ...restProps }: BackIconPropsType) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('stroke-foreground', className)}
      {...restProps}>
      <g id='back icon'>
        <path
          id='Vector'
          d='M17 21L8.18082 12.424C7.93973 12.19 7.93973 11.81 8.18082 11.576L17 3'
          strokeWidth='1.5'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}
