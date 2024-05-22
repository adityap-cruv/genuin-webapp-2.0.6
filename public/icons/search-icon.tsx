import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function SearchIcon({ ...props }: Props) {
  return (
    <svg
      width="30"
      height="30"
      {...props}
      viewBox="0 0 24 24"
      stroke="#111111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M14.4121 14.4121L20 20" strokeWidth="1.5" strokeLinecap="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16Z"
        strokeWidth="1.5"
      />
    </svg>
  )
}
