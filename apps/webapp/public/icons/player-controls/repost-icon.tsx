import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function RepostIcon({ ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      stroke="black"
      viewBox="0 0 32 32"
      fill="none"
      {...props}>
      <path
        d="M25 7.66386C23.3752 5.85342 21.2373 4.57747 18.8693 4.00482C16.5012 3.43215 14.0145 3.58977 11.7384 4.45681C9.46211 5.32385 7.50355 6.85947 6.12177 8.86047C4.73998 10.8615 4.00009 13.2336 4 15.663V16.6667"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 23.6675C8.62475 25.4789 10.7625 26.7555 13.1304 27.3284C15.4983 27.9015 17.9848 27.7438 20.261 26.8765C22.5372 26.0091 24.4958 24.473 25.8777 22.4711C27.2596 20.4693 27.9996 18.0962 28 15.6656V14.6667"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M25 17.6667L28 14.6667L31 17.6667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14.6667L4 17.6667L1 14.6667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11.6667V19.6667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15.6667H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
