// Import necessary modules and types from React and class-variance-authority
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

// Define the closeVariant function using cva to handle different styles based on props
const closeVariant = cva('stroke-foreground', {
  variants: {
    variant: {
      light: 'stroke-secondary', // Light variant style
      transparent: 'stroke-foreground', // Transparent variant style
      dark: 'stroke-foreground', // Dark variant style
    },
    size: {
      sm: 'w-4 h-4', // Small size style (16px)
      md: 'w-6 h-6', // Medium size style (24px)
      lg: 'w-8 h-8', // Large size style (32px)
    },
  },
})

// Define the Props type for the CloseIcon component
type Props = Readonly<
  ComponentProps<'svg'> &
    VariantProps<typeof closeVariant> & {
      variant?: 'light' | 'transparent' | 'dark' | null
      size?: 'sm' | 'md' | 'lg'
    }
>

// Define the CloseIcon functional component
export function CloseIcon({
  variant = 'dark',
  size = 'md',
  ...props
}: Readonly<Props>) {
  return (
    // SVG element representing the close icon
    <svg
      className={cn(closeVariant({ variant, size }))} // Apply styles based on variant and size props
      viewBox='0 0 24 24' // Set the viewBox attribute for the SVG
      fill='none' // Ensure no fill color is applied by default
      xmlns='http://www.w3.org/2000/svg' // Set the XML namespace for the SVG
      {...props} // Spread any additional props onto the SVG element
    >
      {/* Path for the first diagonal line of the close icon */}
      <path
        d='M4 20L20 4' // Define the path for the line
        strokeWidth='1.5' // Set the stroke width
        strokeLinecap='round' // Set the stroke line cap to round
        strokeLinejoin='round' // Set the stroke line join to round
        className={closeVariant({ variant })} // Apply styles based on variant prop
      />
      {/* Path for the second diagonal line of the close icon */}
      <path
        d='M20 20L4 4' // Define the path for the line
        strokeWidth='1.5' // Set the stroke width
        strokeLinecap='round' // Set the stroke line cap to round
        strokeLinejoin='round' // Set the stroke line join to round
        className={closeVariant({ variant })} // Apply styles based on variant prop
      />
    </svg>
  )
}
