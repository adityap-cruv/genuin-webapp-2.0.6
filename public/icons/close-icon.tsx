import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const closeVariant = cva('', {
  variants: {
    variant: {
      light: 'stroke-monochrome-white',
      transparent: 'stroke-monochrome-white',
      dark: 'stroke-monochrome-black',
    },
  },
})

type Props = Readonly<
  ComponentProps<'svg'> & VariantProps<typeof closeVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }
>

export function CloseIcon({ variant = 'light', ...props }: Readonly<Props>) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 21L21 3"
        stroke="#111111"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={closeVariant({ variant })}
      />
      <path
        d="M21 21L3 3"
        stroke="#111111"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={closeVariant({ variant })}
      />
    </svg>
  )
}
