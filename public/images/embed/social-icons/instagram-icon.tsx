import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const iconVariant = cva('', {
  variants: {
    variant: {
      dark: 'stroke-monochrome-black',
      light: 'stroke-monochrome-white',
    },
  },
})

type InstagramIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof iconVariant> & { variant?: 'light' | 'dark' | null }

export function InstagramIcon({ variant = 'light', className, ...props }: InstagramIconPropsType) {
  return (
    <svg
      className={cn(iconVariant({ variant }), className)}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <g clipPath="url(#clip0_6000_15763)">
        <path
          d="M14.7614 5.20577C14.5642 5.20577 14.4043 5.04587 14.4043 4.84863C14.4043 4.65139 14.5642 4.49149 14.7614 4.49149"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.7617 5.20577C14.959 5.20577 15.1189 5.04587 15.1189 4.84863C15.1189 4.65139 14.959 4.49149 14.7617 4.49149"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.22656 4.90201C1.22656 2.87197 2.87224 1.22628 4.9023 1.22628H14.7043C16.7343 1.22628 18.38 2.87197 18.38 4.90201V14.704C18.38 16.734 16.7343 18.3797 14.7043 18.3797H4.9023C2.87224 18.3797 1.22656 16.734 1.22656 14.704V4.90201Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.16016 9.80285C6.16016 10.2812 6.25438 10.7549 6.43745 11.1969C6.62052 11.6389 6.88885 12.0405 7.22712 12.3787C7.56539 12.717 7.96698 12.9853 8.40895 13.1684C8.85092 13.3515 9.32463 13.4457 9.80301 13.4457C10.2814 13.4457 10.7551 13.3515 11.1971 13.1684C11.639 12.9853 12.0406 12.717 12.3789 12.3787C12.7172 12.0405 12.9855 11.6389 13.1686 11.1969C13.3516 10.7549 13.4459 10.2812 13.4459 9.80285C13.4459 8.83671 13.0621 7.91013 12.3789 7.22696C11.6957 6.5438 10.7692 6.16 9.80301 6.16C8.83687 6.16 7.91029 6.5438 7.22713 7.22696C6.54396 7.91013 6.16016 8.83671 6.16016 9.80285Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_6000_15763">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
