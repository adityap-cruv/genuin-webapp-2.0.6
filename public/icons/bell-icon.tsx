import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function BellIcon({ ...props }: Props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1284 4C15.484 4 18.2044 6.72029 18.2044 10.076C18.2044 11.9639 18.2044 13.8496 18.2044 15C18.2044 18 20.2297 19 20.2297 19L4.02705 19C4.02705 19 6.05238 18 6.05238 15C6.05238 13.8496 6.05238 11.9639 6.05238 10.076C6.05238 6.72029 8.77269 4 12.1284 4V4Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.156 19.6046 14.156 18.5"
        fill="white"
      />
      <path
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.156 19.6046 14.156 18.5"
        stroke="white"
        strokeWidth="1.5"
      />
      <circle cx="12.1266" cy="2.5" r="1" stroke="white" />
    </svg>
  )
}
