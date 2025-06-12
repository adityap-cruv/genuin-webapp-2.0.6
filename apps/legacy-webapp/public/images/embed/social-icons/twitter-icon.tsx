import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const twitterVariant = cva('', {
  variants: {
    variant: {
      dark: 'stroke-monochrome-black',
      light: 'stroke-monochrome-white',
    },
  },
})

type TwitterIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof twitterVariant> & { variant?: 'light' | 'dark' | null }

export function TwitterIcon({ variant = 'dark', className, ...restProps }: TwitterIconPropsType) {
  return (
    <svg
      className={cn(twitterVariant({ variant }), className)}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}>
      <path
        d="M17.8125 3.75C17.8125 3.75 17.2656 5.39063 16.25 6.40625C17.5 14.2188 8.90625 19.9219 2.1875 15.4688C3.90625 15.5469 5.625 15 6.875 13.9063C2.96875 12.7344 1.01562 8.125 2.96875 4.53125C4.6875 6.5625 7.34375 7.73438 10 7.65625C9.29688 4.375 13.125 2.5 15.4688 4.6875C16.3281 4.6875 17.8125 3.75 17.8125 3.75Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
