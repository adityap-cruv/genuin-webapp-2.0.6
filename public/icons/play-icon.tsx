import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function PlayIcon({ ...props }: Props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="play">
        <path
          id="Triangle"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.2532 11.2854C18.7927 11.6091 18.7927 12.3909 18.2532 12.7146L6.12292 19.9928C5.56748 20.326 4.86084 19.9259 4.86084 19.2782L4.86084 4.72182C4.86084 4.07408 5.56748 3.67399 6.12292 4.00725L18.2532 11.2854Z"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
