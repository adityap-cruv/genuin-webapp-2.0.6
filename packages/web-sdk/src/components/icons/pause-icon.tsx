import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

// Define the pauseVariant function using cva to handle different styles based on props
const pauseVariant = cva('', {
  variants: {
    variant: {
      dark: 'fill-black', // Light variant style
      transparent: 'fill-white', // Transparent variant style
      light: 'fill-white', // Dark variant style
    },
  },
})

type PauseIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof pauseVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }

export function PauseIcon({ variant = 'dark', className, ...restProps }: PauseIconPropsType) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
      className={cn('', className)}>
      <path
        d="M6.07167 3H8.92882C8.92882 3 10.0002 3 10.0002 4.22727V19.7727C10.0002 19.7727 10.0002 21 8.92882 21H6.07167C6.07167 21 5.00024 21 5.00024 19.7727V4.22727C5.00024 4.22727 5.00024 3 6.07167 3Z"
        className={cn(pauseVariant({ variant }), className)}
      />
      <path
        d="M15.0717 3H17.9288C17.9288 3 19.0002 3 19.0002 4.22727V19.7727C19.0002 19.7727 19.0002 21 17.9288 21H15.0717C15.0717 21 14.0002 21 14.0002 19.7727V4.22727C14.0002 4.22727 14.0002 3 15.0717 3Z"
        className={cn(pauseVariant({ variant }), className)}
      />
    </svg>
  )
}
