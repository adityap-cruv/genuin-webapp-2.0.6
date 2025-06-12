import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// Define the forwardVariant function using cva to handle different styles based on props
const forwardVariant = cva('', {
  variants: {
    variant: {
      dark: 'fill-monochrome-black', // Light variant style
      transparent: 'fill-monochrome-white', // Transparent variant style
      light: 'fill-monochrome-white', // Dark variant style
    },
  },
})

// Define the Props type for the ForwardIcon component
type ForwardIconPropsType = ComponentProps<'svg'> &
  VariantProps<typeof forwardVariant> & { variant?: 'light' | 'transparent' | 'dark' | null }

export function ForwardIcon({ variant = 'light', className, ...restProps }: ForwardIconPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 16 10" fill="none" {...restProps}>
      <path
        className={cn(forwardVariant({ variant }), className)}
        d="M15.1661 4.40567L8.41581 0.11964C8.30286 0.0480561 8.17164 0.00699027 8.03613 0.000816111C7.90062 -0.00535805 7.76588 0.0235907 7.64628 0.0845792C7.52667 0.145568 7.42667 0.236312 7.35694 0.347147C7.2872 0.457982 7.25033 0.584757 7.25026 0.71397V3.66562L1.66555 0.11964C1.5526 0.0480561 1.42138 0.00699027 1.28587 0.000816111C1.15035 -0.00535805 1.01562 0.0235907 0.896015 0.0845792C0.776409 0.145568 0.676413 0.236312 0.606675 0.347147C0.536937 0.457982 0.50007 0.584757 0.5 0.71397L0.5 9.28603C0.50007 9.41524 0.536937 9.54202 0.606675 9.65285C0.676413 9.76369 0.776409 9.85443 0.896015 9.91542C1.01562 9.97641 1.15035 10.0054 1.28587 9.99918C1.42138 9.99301 1.5526 9.95194 1.66555 9.88036L7.25026 6.33438V9.28603C7.25033 9.41524 7.2872 9.54202 7.35694 9.65285C7.42667 9.76369 7.52667 9.85443 7.64628 9.91542C7.76588 9.97641 7.90062 10.0054 8.03613 9.99918C8.17164 9.99301 8.30286 9.95194 8.41581 9.88036L15.1661 5.59433C15.2688 5.52909 15.353 5.44072 15.4113 5.33704C15.4695 5.23336 15.5 5.11759 15.5 5C15.5 4.88241 15.4695 4.76664 15.4113 4.66296C15.353 4.55928 15.2688 4.47091 15.1661 4.40567Z"
      />
    </svg>
  )
}
