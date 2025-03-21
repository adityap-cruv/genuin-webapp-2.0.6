import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const facebookVariant = cva('', {
  variants: {
    variant: {
      dark: 'stroke-monochrome-black',
      light: 'stroke-monochrome-white',
    },
  },
})

type FacebookIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof facebookVariant> & { variant?: 'light' | 'dark' | null }

export function FacebookIcon({ variant = 'dark', className, ...restProps }: FacebookIconPropsType) {
  return (
    <svg
      className={cn(facebookVariant({ variant }), className)}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}>
      <path
        d="M14.6999 1.45351H12.136C11.0027 1.45351 9.9157 1.90367 9.11437 2.70508C8.31297 3.50648 7.86273 4.59344 7.86273 5.72672V8.2907H5.29883V11.7093H7.86273V18.5465H11.2813V11.7093H13.8453L14.6999 8.2907H11.2813V5.72672C11.2813 5.50008 11.3714 5.28265 11.5316 5.12242C11.692 4.96211 11.9094 4.87211 12.136 4.87211H14.6999V1.45351Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
