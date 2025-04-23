import { type ComponentProps } from 'react'

type Props = { className?: string; fill?: string } & ComponentProps<'svg'>

// TODO: This icon is mainly used in the sidebar, where active/inactive states are handled with fill. In the future, we should generalize all SVGs to avoid passing the fill prop separately.
export function BellIcon({ className, fill, ...restProps }: Props) {
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
        d='M16.17 5C20.88 5 24.5 8.62 24.5 13.33V19C24.5 22.67 27 24 27 24H5.33C5.33 24 7.83 22.67 7.83 19V13.33C7.83 8.62 11.45 5 16.17 5Z'
        stroke={fill}
        strokeWidth='2'
        strokeLinejoin='round'
      />
      <path
        d='M12.5 24.5C12.5 26.2 13.8 27.5 15.5 27.5C17.2 27.5 18.5 26.2 18.5 24.5'
        stroke={fill}
        strokeWidth='2'
      />
      <circle
        cx='16'
        cy='4'
        r='1.5'
        stroke={fill}
      />
    </svg>
  )
}
