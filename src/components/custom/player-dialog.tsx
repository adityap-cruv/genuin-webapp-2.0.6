'use client'
import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@icons/close-icon'

import { cn } from '@lib/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => <DialogPrimitive.Portal {...props} />
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogPrimitive.Content
      ref={ref}
      className={cn('group fixed inset-0 z-20 w-full bg-monochrome-black/80', className)}
      {...props}>
      <DialogPrimitive.Close className="absolute right-3 top-3 z-20 transition-opacity disabled:pointer-events-none">
        <CloseIcon
          onClick={() => {
            window.history.back()
          }}
          variant={'light'}
          size="lg"
        />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      <div className="fixed bottom-0 z-10 grid h-fit w-fit duration-300 group-data-[state=open]:animate-in group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=open]:fade-in-0 group-data-[state=closed]:zoom-out-95 group-data-[state=open]:zoom-in-95 group-data-[state=closed]:slide-out-to-left-1/2 group-data-[state=closed]:slide-out-to-top-[48%] group-data-[state=open]:slide-in-from-left-1/2 group-data-[state=open]:slide-in-from-top-[48%] sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg">
        {children}
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export { Dialog as PlayerDialog, DialogTrigger as PlayerDialogTrigger, DialogContent as PlayerDialogContent }
