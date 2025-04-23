import { type ComponentProps } from 'react'
import { cn } from '@/utils'

export function ChevronUp({ className, ...restProps }: ComponentProps<'svg'>) {
  return (
    <svg
      className={cn(className)}
      width='20'
      height='11'
      viewBox='0 0 20 11'
      fill='none'
      stroke='white'
      xmlns='http://www.w3.org/2000/svg'
      {...restProps}>
      <g id='icon-drawer'>
        <path
          id='Vector'
          d='M1 10L9.576 1.18082C9.81004 0.939725 10.19 0.939725 10.424 1.18082L19 10'
          stroke-width='1.5'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </g>
    </svg>
  )
}
