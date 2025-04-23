import { type ComponentProps } from 'react'

type Props = ComponentProps<'svg'>
export function LoginIcon({ ...props }: Props) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21.3359 4H25.7804C26.3698 4 26.935 4.28095 27.3517 4.78105C27.7685 5.28115 28.0026 5.95942 28.0026 6.66667V25.3333C28.0026 26.0406 27.7685 26.7189 27.3517 27.219C26.935 27.719 26.3698 28 25.7804 28H21.3359"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3359 22.6663L20.0026 15.9997L13.3359 9.33301"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 16H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
