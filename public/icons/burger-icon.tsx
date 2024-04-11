import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'> & { className?: string }

export function BurgerIcon({ className = 'stroke-monochrome-black', ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      className={className}>
      <path d="M1 1H13" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 6H13" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 11H13" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
