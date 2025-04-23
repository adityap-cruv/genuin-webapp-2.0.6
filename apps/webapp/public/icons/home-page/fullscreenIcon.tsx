import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function CustomFullscreenIcon({ ...props }: Props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="SVG" clipPath="url(#clip0_50661_10727)">
        <path
          id="Vector"
          d="M4.66536 9.33203H3.33203V12.6654H6.66536V11.332H4.66536V9.33203ZM3.33203 6.66536H4.66536V4.66536H6.66536V3.33203H3.33203V6.66536ZM11.332 11.332H9.33203V12.6654H12.6654V9.33203H11.332V11.332ZM9.33203 3.33203V4.66536H11.332V6.66536H12.6654V3.33203H9.33203Z"
          //   fill="#343A40"
        />
      </g>
      <defs>
        <clipPath id="clip0_50661_10727">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
