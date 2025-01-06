import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'> & { className?: string; strokeClassName?: string }

export function BurgerIcon({
  className = 'stroke-monochrome-black',
  strokeClassName = 'stroke-monochrome-black',
  ...props
}: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}>
      <path
        d="M2 18.0031H22"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
      />
      <path
        d="M2 12.0031H22"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
      />
      <path
        d="M2 6.00305H22"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClassName}
      />
    </svg>
  )
}
