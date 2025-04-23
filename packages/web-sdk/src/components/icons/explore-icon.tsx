import { type ComponentProps } from 'react'

type Props = { className?: string } & ComponentProps<'svg'>

// TODO: this icon is only used in sidebar, so in sidebar we are handling active or inactive colors with fill, In future we have to make more generalized for all svgs. so that we don't have to pass fill prop in all svgs.
export function ExploreIcon({ className, fill, ...restProps }: Props) {
  return (
    <svg
      width='32'
      height='32'
      viewBox='0 0 32 32'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      fill='none'
      {...restProps}>
      <path
        d='M16 29C23.1797 29 29 23.1797 29 16C29 8.8203 23.1797 3 16 3C8.8203 3 3 8.8203 3 16C3 23.1797 8.8203 29 16 29Z'
        stroke={fill}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M22.6842 9.31588C22.5424 9.17416 22.3641 9.07473 22.1689 9.02876C21.9738 8.98278 21.7699 8.99207 21.5797 9.05559L12.1862 12.1863L9.05558 21.5797C8.99207 21.7698 8.98278 21.9739 9.02877 22.1689C9.07476 22.364 9.17419 22.5423 9.3159 22.6841C9.45762 22.8258 9.63603 22.9253 9.8311 22.9712C10.0262 23.0172 10.2302 23.008 10.4203 22.9444L19.8138 19.8138L22.9445 10.4203C23.0079 10.2302 23.0172 10.0262 22.9712 9.83111C22.9253 9.63603 22.8258 9.45762 22.6842 9.31588Z'
        strokeWidth='2'
        stroke={fill}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle
        cx='16'
        cy='16'
        r='1'
        strokeWidth='2'
        stroke={fill}
      />
    </svg>
  )
}
