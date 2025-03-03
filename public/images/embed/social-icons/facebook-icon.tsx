import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// Define the facebookVariant function using cva to handle different styles based on props
const facebookVariant = cva('', {
  variants: {
    variant: {
      dark: 'fill-monochrome-black',
      transparent: 'fill-monochrome-white',
      light: 'fill-monochrome-white',
    },
  },
})

// Define the Props type for the FacebookIcon component
type FacebookIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof facebookVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }

export function FacebookIcon({ variant = 'dark', className, ...restProps }: FacebookIconPropsType) {
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
        d="M18.1958 21.2481C18.1238 21.2481 16.5398 21.2481 15.8198 21.2481C15.4358 21.2481 15.3158 21.1041 15.3158 20.7441C15.3158 19.7841 15.3158 18.8001 15.3158 17.8401C15.3158 17.4561 15.4598 17.3361 15.8198 17.3361H18.1958C18.1958 17.2641 18.1958 15.8721 18.1958 15.2241C18.1958 14.2641 18.3638 13.3521 18.8438 12.5121C19.3478 11.6481 20.0678 11.0721 20.9798 10.7361C21.5798 10.5201 22.1798 10.4241 22.8278 10.4241H25.1798C25.5158 10.4241 25.6598 10.5681 25.6598 10.9041V13.6401C25.6598 13.9761 25.5158 14.1201 25.1798 14.1201C24.5318 14.1201 23.8838 14.1201 23.2358 14.1441C22.5878 14.1441 22.2518 14.4561 22.2518 15.1281C22.2278 15.8481 22.2518 16.5441 22.2518 17.2881H25.0358C25.4198 17.2881 25.5638 17.4321 25.5638 17.8161V20.7201C25.5638 21.1041 25.4438 21.2241 25.0358 21.2241C24.1718 21.2241 22.3238 21.2241 22.2518 21.2241V29.0481C22.2518 29.4561 22.1318 29.6001 21.6998 29.6001C20.6918 29.6001 19.7078 29.6001 18.6998 29.6001C18.3398 29.6001 18.1958 29.4561 18.1958 29.0961C18.1958 26.5761 18.1958 21.3201 18.1958 21.2481Z"
        className={cn(facebookVariant({ variant }), className)}
      />
    </svg>
  )
}
