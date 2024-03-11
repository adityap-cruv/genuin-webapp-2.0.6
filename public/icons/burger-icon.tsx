import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function BurgerIcon({ ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} width="14" height="12" viewBox="0 0 14 12" fill="none">
      <path d="M1 1H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 6H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 11H13" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
