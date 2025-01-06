import React from 'react'
import { GenuinIcon } from '@icons/genuin-icon'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import cn from 'classnames'

const badgeVariants = cva('', {
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

const spanVariants = cva('', {
  variants: {
    variant: {
      light: 'bg-monochrome-white',
      dark: 'bg-tertiary-300',
      primary: 'bg-primary',
    },
  },
  defaultVariants: {
    variant: 'light',
  },
})

interface GenuinBadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
}

const GenuinBadge: React.FC<GenuinBadgeProps> = ({ size, variant, className }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={cn('h-1 w-1 rounded-full', spanVariants({ variant }))}></span>
      <GenuinIcon.icon className={badgeVariants({ size, variant })} />
    </div>
  )
}

export default GenuinBadge
