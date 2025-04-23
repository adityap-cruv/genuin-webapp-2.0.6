// Import necessary libraries and modules
import React from 'react'
import { cva } from 'class-variance-authority'
import { GenuinIcon } from '@/components/icons/genuin-icon'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

// Define the class variance authority (cva) for the badge variants
const badgeVariants = cva('', {
  variants: {
    size: {
      sm: 'h-2 w-2', // Small size classes
      md: 'h-4 w-4', // Medium size classes
      lg: 'h-6 w-6', // Large size classes
    },
    variant: {
      light: 'fill-foreground', // Light variant class
      dark: 'fill-foreground', // Dark variant class
      primary: 'fill-primary', // Primary variant class
    },
  },
  defaultVariants: {
    size: 'md', // Default size is medium
    variant: 'light', // Default variant is light
  },
})

// Define the class variance authority (cva) for the span variants
const spanVariants = cva('', {
  variants: {
    variant: {
      light: 'bg-tertiary-300', // Light variant class
      dark: 'bg-tertiary-300', // Dark variant class
      primary: 'bg-primary', // Primary variant class
    },
  },
  defaultVariants: {
    variant: 'light', // Default variant is light
  },
})

// Define the properties for the GenuinBadge component
type GenuinBadgeProps = {
  className?: string // Optional className prop to apply additional custom classes
} & VariantProps<typeof badgeVariants>

// Define the GenuinBadge component
const GenuinBadge: React.FC<GenuinBadgeProps> = ({
  size,
  variant,
  className,
}) => {
  return (
    // Container div with flexbox properties and additional custom classes
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Span element with variant-specific and additional classes */}
      <span
        className={cn(
          'h-1 w-1 rounded-full',
          spanVariants({ variant }),
        )}></span>
      {/* GenuinIcon component with size and variant-specific classes */}
      <GenuinIcon.icon className={badgeVariants({ size, variant })} />
    </div>
  )
}

// Export the GenuinBadge component as the default export
export default GenuinBadge
