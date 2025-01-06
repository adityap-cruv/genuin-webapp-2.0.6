// Import necessary libraries and modules
import React from 'react'
import { cva } from 'class-variance-authority'
import cn from 'classnames'

// Define the properties for the BrandBadge component
interface BrandBadgeProps {
  variant?: 'light' | 'primary' | 'dark' // Optional variant prop to determine the color scheme
  className?: string // Optional className prop to apply additional custom classes
}

// Define the class variance authority (cva) for the BrandBadge component
const textClasses = cva('', {
  variants: {
    variant: {
      light: 'text-monochrome-white bg-monochrome-white/20', // Light variant classes
      primary: 'text-primary', // Primary variant class
      dark: 'bg-tertiary-200', // Dark variant class
    },
  },
  defaultVariants: {
    variant: 'primary', // Default variant is 'primary'
  },
})

// Define the BrandBadge component
const BrandBadge: React.FC<BrandBadgeProps> = ({ variant = 'primary', className }) => {
  return (
    // Container div with flexbox properties and additional custom classes
    <div className={`flex items-center gap-0.5 ${className}`}>
      {/* Paragraph element with variant-specific and additional classes */}
      <p className={cn(textClasses({ variant }), 'rounded-full px-2 py-1 text-cap-1-demi')}>Brand</p>
    </div>
  )
}

// Export the BrandBadge component as the default export
export default BrandBadge
