import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-blue-20 after::bg-blue-20',
        outline: 'border',
      },
      outlineColor: {
        white: 'border-monochrome-white hover:bg-monochrome-white',
        'genuin-blue': 'border-primary bg-background',
        black: 'border-new-off-black ',
      },
      size: {
        default: 'px-2 py-2',
        sm: 'rounded-md p-2 py-2',
        lg: 'h rounded-md px-8',
        'index-page': 'px-4 py-3',
        custom: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, outlineColor, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, outlineColor }), className)} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
