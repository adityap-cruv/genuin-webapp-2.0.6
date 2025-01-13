import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function ShoppingCartIcon({ ...props }: Props) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      stroke="black"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="M19.2854 13.9285V7.38092C19.2854 5.99169 18.7775 4.65936 17.8733 3.67702C16.9691 2.69469 15.7427 2.14282 14.464 2.14282C13.1853 2.14282 11.9589 2.69469 11.0547 3.67702C10.1505 4.65936 9.64258 5.99169 9.64258 7.38092V13.9285"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="5.28613" y="9.57141" width="18.3571" height="18.3571" rx="3.6" strokeWidth="2" />
    </svg>
  )
}
