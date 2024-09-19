import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

type PauseIconPropsType = ComponentProps<'svg'>

export function PauseIcon({ className, ...restProps }: PauseIconPropsType) {
  return (
    <svg
      className={cn('', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...restProps}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4L5 20H9V4H5Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 4L15 20H19V4H15Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
