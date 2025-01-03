import React from 'react'
import { TickIcon } from '@icons/tick-icon'
import { cva } from 'class-variance-authority'
import cn from 'classnames'

interface VerifiedBadgeProps {
  className?: string
  variant?: 'light' | 'primary' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const badgeClasses = cva('', {
  variants: {
    size: {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className, variant, size }) => {
  return (
    <div className={cn('flex items-center gap-0.5', badgeClasses({ size }), className)}>
      <TickIcon variant={variant} className={badgeClasses({ size })} />
    </div>
  )
}

export default VerifiedBadge
