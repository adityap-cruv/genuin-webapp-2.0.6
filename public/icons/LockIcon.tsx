import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>

export function LockIcon({ ...props }: Props) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" {...props} xmlns="http://www.w3.org/2000/svg">
      <g id="lock">
        <rect
          id="Rectangle 2"
          x="13.3281"
          y="29.334"
          width="37.3333"
          height="26.6667"
          rx="1"
          // stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="Rectangle 2_2"
          d="M18.6719 21.3333C18.6719 13.9695 24.6414 8 32.0052 8V8C39.369 8 45.3385 13.9695 45.3385 21.3333V29.3333H18.6719V21.3333Z"
          // stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
