import { cn } from '@/utils'
import { ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function BurgerIcon({
  className,
  xmlns,
  width,
  height,
  viewBox,
  ...restProps
}: Props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      className={cn(className)}
      {...restProps}>
      <g id='Navigation-Menu--Streamline-Ultimate'>
        <path
          id='Vector'
          d='M2 18.0029H22'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          id='Vector_2'
          d='M2 12.0029H22'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          id='Vector_3'
          d='M2 6.00293H22'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}
