// Import necessary types and functions from React and class-variance-authority
import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// Define the bellVariant function using cva to handle different styles based on props
const bellVariant = cva('', {
  variants: {
    variant: {
      light: 'stroke-monochrome-white', // Light variant style
      primary: 'stroke-primary', // Primary variant style
      dark: 'stroke-secondary', // Dark variant style
    },
    size: {
      sm: 'w-6 h-6', // Small size style
      md: 'w-8 h-8', // Medium size style
    },
  },
})

// Define the Props type for the BellIcon component
type Props = Readonly<
  ComponentProps<'svg'> & VariantProps<typeof bellVariant> & { variant?: 'light' | 'primary' | 'dark' | null }
>

// BellIcon component definition
export function BellIcon({ variant = 'dark', size = 'md', ...props }: Readonly<Props>) {
  return (
    <svg
      className={bellVariant({ variant, size })} // Apply styles based on variant and size props
      viewBox="0 0 24 24" // Set the viewBox attribute for the SVG
      fill="none" // Ensure no fill color is applied by default
      xmlns="http://www.w3.org/2000/svg" // Set the XML namespace for the SVG
      {...props} // Spread any additional props onto the SVG element
    >
      {/* Define the main bell shape path */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1284 4C15.484 4 18.2044 6.72029 18.2044 10.076C18.2044 11.9639 18.2044 13.8496 18.2044 15C18.2044 18 20.2297 19 20.2297 19L4.02705 19C4.02705 19 6.05238 18 6.05238 15C6.05238 13.8496 6.05238 11.9639 6.05238 10.076C6.05238 6.72029 8.77269 4 12.1284 4V4Z"
        stroke="white" // Set the stroke color to white
        strokeWidth="1.5" // Set the stroke width
        strokeLinejoin="round" // Set the stroke line join style
        className={bellVariant({ variant })} // Apply styles based on variant prop
      />
      {/* Define the bell clapper path */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.156 19.6046 14.156 18.5"
        fill="white" // Set the fill color to white
        className={bellVariant({ variant })} // Apply styles based on variant prop
      />
      <path
        d="M10.1053 18.5C10.1053 19.6046 11.0121 20.5 12.1306 20.5C13.2492 20.5 14.156 19.6046 14.156 18.5"
        stroke="white" // Set the stroke color to white
        strokeWidth="1.5" // Set the stroke width
        className={bellVariant({ variant })} // Apply styles based on variant prop
      />
      {/* Define the small circle at the top of the bell */}
      <circle cx="12.1266" cy="2.5" r="1" stroke="white" className={bellVariant({ variant })} />
    </svg>
  )
}
