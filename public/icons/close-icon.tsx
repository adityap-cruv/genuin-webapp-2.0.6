import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const closeVariant = cva('', {
  variants: {
    variant: {
      light: 'stroke-monochrome-white',
      transparent: 'stroke-monochrome-black',
      dark: 'stroke-monochrome-black',
    },
    size: {
      sm: 'w-4 h-4', // 16px
      md: 'w-6 h-6', // 24px
      lg: 'w-8 h-8', // 32px
    },
  },
})

type Props = Readonly<
  ComponentProps<'svg'> &
    VariantProps<typeof closeVariant> & { variant?: 'light' | 'transparent' | 'dark' | null; size?: 'sm' | 'md' | 'lg' }
>

export function CloseIcon({ variant = 'dark', size = 'md', ...props }: Readonly<Props>) {
  return (
    <svg
      className={closeVariant({ variant, size })}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="M4 20L20 4"
        stroke="#111111"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={closeVariant({ variant })}
      />
      <path
        d="M20 20L4 4"
        stroke="#111111"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={closeVariant({ variant })}
      />
    </svg>
  )
}
