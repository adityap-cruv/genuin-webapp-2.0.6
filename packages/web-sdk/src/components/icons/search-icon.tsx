// Import necessary modules and types from React and class-variance-authority
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

// Define the searchVariant function using cva to handle different styles based on props
const searchVariant = cva('', {
  variants: {
    variant: {
      light: 'stroke-black dark:stroke-foreground', // Light variant style
      transparent: 'stroke-white', // Transparent variant style
      dark: 'stroke-white', // Dark variant style
    },
  },
})

// Define the Props type for the SearchIcon component
type Props = Readonly<
  ComponentProps<'svg'> &
    VariantProps<typeof searchVariant> & {
      variant?: 'light' | 'transparent' | 'dark' | null
    }
>

// Define the SearchIcon functional component
export function SearchIcon({
  variant = 'light',
  className,
  ...props
}: Readonly<Props>) {
  return (
    // SVG element representing the search icon
    <svg
      width='24' // Set the width of the SVG
      height='24' // Set the height of the SVG
      {...props} // Spread any additional props onto the SVG element
      viewBox='0 0 24 24' // Define the viewBox for the SVG
      stroke='#111111' // Set the default stroke color
      className={cn(searchVariant({ variant }), className)} // Apply styles based on variant prop and additional className
      fill='none' // Ensure no fill color is applied by default
      xmlns='http://www.w3.org/2000/svg' // Set the XML namespace for the SVG
    >
      {/* Path representing the handle of the magnifying glass */}
      <path
        d='M14.4121 14.4121L20 20'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      {/* Path representing the circular part of the magnifying glass */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16Z'
        strokeWidth='1.5'
      />
    </svg>
  )
}
