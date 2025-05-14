// Import necessary modules and types from React and class-variance-authority
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// Define the bellVariant function using cva to handle different styles based on props
const bellVariant = cva('', {
  variants: {
    variant: {
      light: '',
      transparent: 'stroke-primary',
      dark: '',
    },
    type: {
      stroke: '',
      fill: '',
    },
  },
  compoundVariants: [
    { variant: 'light', type: 'stroke', className: 'stroke-primary' },
    { variant: 'light', type: 'fill', className: 'fill-primary' },

    { variant: 'dark', type: 'stroke', className: 'stroke-monochrome-black' },
    { variant: 'dark', type: 'fill', className: 'fill-monochrome-black' },
  ],
})

// Define the Props type for the BellIconOff component
type Props = Readonly<
  ComponentProps<'svg'> & VariantProps<typeof bellVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }
>

// Define the BellIconOff functional component
export function BellIconOff({ variant = 'light', ...props }: Readonly<Props>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 18 18" fill="none" {...props}>
      <path
        d="M3.00427 14.249L15.1562 14.249C15.1562 14.249 13.6373 13.499 13.6373 11.249C13.6373 10.3862 13.6373 8.97191 13.6373 7.556C13.6373 5.03924 11.597 2.99902 9.08026 2.99902V2.99902C6.5635 2.99902 4.52326 5.03928 4.52326 7.55603C4.52326 8.32425 4.52326 9.08641 4.52326 9.74902"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={bellVariant({ variant, type: 'stroke' })}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5831 13.874C7.5831 14.7025 8.26318 15.374 9.1021 15.374C9.94102 15.374 10.6211 14.7025 10.6211 13.874"
        className={bellVariant({ variant, type: 'fill' })}
      />
      <path
        d="M7.5831 13.874C7.5831 14.7025 8.26318 15.374 9.1021 15.374C9.94102 15.374 10.6211 14.7025 10.6211 13.874"
        strokeWidth="1.125"
        className={bellVariant({ variant, type: 'stroke' })}
      />
      <circle
        cx="9.09766"
        cy="1.875"
        r="0.75"
        strokeWidth="0.75"
        className={bellVariant({ variant, type: 'stroke' })}
      />
      <path
        d="M1.125 15.75L16.5 1.5"
        strokeWidth="1.125"
        strokeLinecap="round"
        className={bellVariant({ variant, type: 'stroke' })}
      />
    </svg>
  )
}
