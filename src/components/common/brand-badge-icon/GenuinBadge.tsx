import React from 'react'
import { GenuinIcon } from '@icons/genuin-icon'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

const badgeVariants = cva('h-4 w-4 fill-monochrome-white', {
  variants: {
    size: {
      sm: 'h-2 w-2',
      md: 'h-4 w-4',
      lg: 'h-6 w-6',
    },
    variant: {
      light: 'fill-monochrome-white',
      dark: 'fill-monochrome-black',
      primary: 'fill-primary',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'light',
  },
})

interface GenuinBadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
}

const GenuinBadge: React.FC<GenuinBadgeProps> = ({ size, variant, className }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="rounded-full bg-monochrome-white px-1 py-1"></span>
      <GenuinIcon.icon className={badgeVariants({ size, variant })} />
    </div>
  )
}

export default GenuinBadge
