import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function PlayIconRound({ ...props }: Props) {
  return (
    <svg stroke="black" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0013 29.3327C23.3651 29.3327 29.3346 23.3631 29.3346 15.9993C29.3346 8.63555 23.3651 2.66602 16.0013 2.66602C8.63751 2.66602 2.66797 8.63555 2.66797 15.9993C2.66797 23.3631 8.63751 29.3327 16.0013 29.3327Z"
        strokeWidth="2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.6045 15.4283C23.0361 15.6873 23.0361 16.3127 22.6045 16.5717L12.9003 22.3942C12.4559 22.6608 11.8906 22.3407 11.8906 21.8225L11.8906 10.1775C11.8906 9.65926 12.4559 9.33919 12.9003 9.6058L22.6045 15.4283Z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
