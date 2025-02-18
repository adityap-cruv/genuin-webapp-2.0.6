import type { ComponentProps } from 'react'

export function PipIcon({ className, ...restProps }: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      {...restProps}>
      <rect x="10" y="11.5898" width="10" height="6.66667" rx="1.66667" fill="#C6002B" />
      <path
        d="M19.1673 9.50758V4.16667C19.1673 3.24619 18.4211 2.5 17.5007 2.5L2.50065 2.5C1.58018 2.5 0.833984 3.24619 0.833984 4.16667V15.8333C0.833984 16.7538 1.58018 17.5 2.50065 17.5H7.993"
        stroke="#C6002B"
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
    </svg>
  )
}
