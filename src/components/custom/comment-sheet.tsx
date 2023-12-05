'use client'

import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@lib/utils'

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetPortal = SheetPrimitive.Portal

const sheetVariants = cva(
  'absolute z-50 transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        bottom:
          'inset-x-0 h-5/6 bottom-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        right:
          'inset-y-0 right-0 w-3/4 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
)

type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants>

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = 'bottom', className, children, ...props }, ref) => (
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
    </SheetPrimitive.Content>
  )
)
SheetContent.displayName = SheetPrimitive.Content.displayName

export {
  Sheet as CommentSheet,
  SheetPortal as CommentSheetPortal,
  SheetTrigger as CommentSheetTrigger,
  SheetContent as CommentSheetContent,
}
