import { type ComponentProps } from 'react'
import { cn } from '@/utils'

export function ChevronDown({
  className,
  ...restProps
}: ComponentProps<'svg'>) {
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
          d='M19 0.999999L10.424 9.81918C10.19 10.0603 9.81004 10.0603 9.576 9.81918L1 1'
          stroke-width='1.5'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </g>
    </svg>
  )
}
