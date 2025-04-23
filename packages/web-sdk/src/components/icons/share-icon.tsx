import { type ComponentProps } from 'react'

type IconProps = ComponentProps<'svg'>

export function ShareIcon({ className, ...restProps }: IconProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 32 32'
      fill='none'
      className={className}
      {...restProps}>
      <g id='Share'>
        <path
          id='Vector'
          d='M17.56 25.6737L29 15.3368L17.56 5V11.9637H14.5556C8.2 11.9637 3 17.0362 3 22.9118L3 25.3471C3 25.6736 3.34667 26 3.69333 26H3.80889C4.04 26 4.27111 25.7824 4.38667 25.5648C5.6 22.572 6.9 18.9274 14.5556 18.9274H17.56V25.6737Z'
          strokeWidth='2'
          strokeMiterlimit='10'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
    </svg>
  )
}
