import React from 'react'
import { cva } from 'class-variance-authority'
import cn from 'classnames'

interface BrandBadgeProps {
  variant?: 'light' | 'primary' | 'dark'
  className?: string
}

const textClasses = cva('', {
  variants: {
    variant: {
      light: 'text-monochrome-white bg-monochrome-white/20',
      primary: 'text-primary',
      dark: 'text-monochrome-black bg-monochrome-black/20',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

const BrandBadge: React.FC<BrandBadgeProps> = ({ variant = 'primary', className }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <p className={cn(textClasses({ variant }), 'rounded-full px-2 py-1 text-cap-1-demi')}>Brand</p>
    </div>
  )
}

export default BrandBadge
