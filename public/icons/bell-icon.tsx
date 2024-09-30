import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function BellIcon({ ...props }: Props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12.1291 4C15.4848 4 18.2051 6.72029 18.2051 10.076C18.2051 11.9639 18.2051 13.8496 18.2051 15C18.2051 18 20.2305 19 20.2305 19L4.02782 19C4.02782 19 6.05316 18 6.05316 15C6.05316 13.8496 6.05316 11.9639 6.05316 10.076C6.05316 6.72029 8.77347 4 12.1291 4V4Z"
        // stroke="white"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.1056 18.5C10.1056 19.6046 11.0124 20.5 12.1309 20.5C13.2495 20.5 14.1562 19.6046 14.1562 18.5"
        // fill="white"
      />
      <path
        d="M10.1056 18.5C10.1056 19.6046 11.0124 20.5 12.1309 20.5C13.2495 20.5 14.1562 19.6046 14.1562 18.5"
        // stroke="white"
        stroke-width="1.5"
      />
      <circle
        cx="12.127"
        cy="2.5"
        r="1"
        // stroke="white"
      />
    </svg>
  )
}
