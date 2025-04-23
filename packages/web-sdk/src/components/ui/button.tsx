import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary focus:bg-primary focus:border-primary hover:bg-primary-600 after::bg-primary-600',
        outline: 'border',
        custom: '',
      },
      outlineColor: {
        white: 'border-white hover:bg-background',
        'genuin-blue': 'border-primary focus:border-primary bg-background',
        black: 'border-black ',
      },
      size: {
        default: 'px-2 py-2',
        sm: 'rounded-md p-2',
        lg: 'rounded-md px-8',
        'index-page': 'px-4 py-3',
        custom: 'h-min',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// TODO: Create this component more generalized.
export type ButtonProps = {
  asChild?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, outlineColor, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, outlineColor }),
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
