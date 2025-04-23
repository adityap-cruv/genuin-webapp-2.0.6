import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function AddIcon({ ...props }: Props) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="add">
        <path id="Path 2" d="M22.6615 15.9993H9.32812" strokeWidth="1.8" strokeLinecap="round" />
        <path id="Path 2_2" d="M16.0052 22.6673V9.33398" strokeWidth="1.8" strokeLinecap="round" />
        <path
          id="Oval"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.0052 29.3327C23.369 29.3327 29.3385 23.3631 29.3385 15.9993C29.3385 8.63555 23.369 2.66602 16.0052 2.66602C8.64141 2.66602 2.67188 8.63555 2.67188 15.9993C2.67188 23.3631 8.64141 29.3327 16.0052 29.3327Z"
          strokeWidth="1.8"
        />
      </g>
    </svg>
  )
}
