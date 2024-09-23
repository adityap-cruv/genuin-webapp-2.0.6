import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

type PlayIconPropsType = ComponentProps<'svg'>

export function PlayIcon({ className, ...restProps }: PlayIconPropsType) {
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
        d="M19.2854 11.5713C19.6091 11.7655 19.6091 12.2345 19.2854 12.4287L5.75725 20.5457C5.42399 20.7456 5 20.5056 5 20.1169L5 3.88309C5 3.49445 5.42399 3.25439 5.75725 3.45435L19.2854 11.5713Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
