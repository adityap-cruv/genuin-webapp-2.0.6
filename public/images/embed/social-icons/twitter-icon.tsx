import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// Define the twitterVariant function using cva to handle different styles based on props
const twitterVariant = cva('', {
  variants: {
    variant: {
      dark: 'fill-monochrome-black',
      transparent: 'fill-monochrome-white',
      light: 'fill-monochrome-white',
    },
  },
})

// Define the Props type for the TwitterIcon component
type TwitterIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof twitterVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }

export function TwitterIcon({ variant = 'dark', className, ...restProps }: TwitterIconPropsType) {
  return (
    <svg
      className={cn('', className)}
      width="41"
      height="40"
      viewBox="0 0 41 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}>
      <path
        d="M30.0761 14.0482C29.3561 14.3602 28.6121 14.5762 27.8201 14.6722C28.6361 14.1922 29.2601 13.4242 29.5481 12.4882C28.7801 12.9442 27.9401 13.2562 27.0521 13.4482C26.3321 12.6802 25.3001 12.2002 24.1721 12.2002C21.9881 12.2002 20.2361 13.9762 20.2361 16.1362C20.2361 16.4482 20.2601 16.7362 20.3321 17.0242C17.0681 16.8802 14.1881 15.2962 12.2441 12.9202C10.8521 15.4162 12.4121 17.4802 13.4441 18.1762C12.8201 18.1762 12.1961 17.9842 11.6681 17.6962C11.6681 19.6402 13.0361 21.2482 14.8121 21.6082C14.4281 21.7282 13.5641 21.8002 13.0361 21.6802C13.5401 23.2402 15.0041 24.3922 16.7081 24.4162C15.3641 25.4722 13.3961 26.3122 10.8761 26.0482C12.6281 27.1762 14.6921 27.8242 16.9241 27.8242C24.1721 27.8242 28.1081 21.8242 28.1081 16.6402C28.1081 16.4722 28.1081 16.3042 28.0841 16.1362C28.9001 15.5362 29.5721 14.8402 30.0761 14.0482Z"
        className={cn(twitterVariant({ variant }), className)}
      />
    </svg>
  )
}
