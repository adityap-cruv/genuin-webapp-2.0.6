'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '@lib/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => <DialogPrimitive.Portal {...props} />
DialogPortal.displayName = DialogPrimitive.Portal.displayName

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showDefaultClose: boolean }

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, showDefaultClose = true, ...props }, ref) => (
    <DialogPortal>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-monochrome-black/70 shadow-lg duration-300 focus:outline-none group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0 group-data-[state=closed]:zoom-out-95 group-data-[state=open]:zoom-in-95 group-data-[state=closed]:slide-out-to-left-1/2 group-data-[state=closed]:slide-out-to-top-[48%] group-data-[state=open]:slide-in-from-left-1/2 group-data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        {...props}>
        {showDefaultClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-sm transition-opacity focus:outline-none disabled:pointer-events-none">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn(className)} {...props} />)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn(className)} {...props} />)
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogClose = DialogPrimitive.Close

export {
  Dialog as CustomDialog,
  DialogTrigger as CustomDialogTrigger,
  DialogContent as CustomDialogContent,
  DialogHeader as CustomDialogHeader,
  DialogFooter as CustomDialogFooter,
  DialogTitle as CustomDialogTitle,
  DialogDescription as CustomDialogDescription,
  DialogClose as CustomDialogClose,
}
