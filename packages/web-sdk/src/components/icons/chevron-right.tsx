import { cn } from '@/utils'
import { ComponentProps } from 'react'

type ChevronRightIconProps = ComponentProps<'svg'>

export function ChevronRightIcon({
  className,
  ...restProps
}: ChevronRightIconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn('lucide lucide-chevron-right', className)}
      {...restProps}>
      <path d='m9 18 6-6-6-6' />
    </svg>
  )
}
