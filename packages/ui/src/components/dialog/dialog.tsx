"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@genuin/ui/lib/utils";
import { dialogManager } from "@genuin/ui/lib/dialog-manager";

/**
 * Dialog component with registry tracking.
 *
 * @param {string} type - Required type for the dialog instance.
 *   This type is used for dialog registry tracking.
 *   Pass a type if you need to identify dialogs programmatically.
 */
function Dialog({
  type,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  type: string;
}) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);

  // Determine the actual open state
  const isOpen = isControlled ? open! : internalOpen;

  React.useEffect(() => {
    if (isOpen) {
      dialogManager.registerDialog(type);
    } else {
      dialogManager.unregisterDialog(type);
    }
    // Clean up on unmount
    return () => {
      dialogManager.unregisterDialog(type);
    };
  }, [isOpen, type]);

  // Handle open state changes from user interaction
  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      open={isOpen}
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "gencl:data-[state=open]:animate-in gencl:data-[state=closed]:animate-out gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0 gencl:fixed gencl:inset-0 gencl:z-50 gencl:bg-black/50",
        className
      )}
      {...props}
    />
  );
}

const dialogContentVariants = cva(
  [
    "gencl:data-[state=open]:animate-in gencl:data-[state=closed]:animate-out",
    "gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0",
    "gencl:data-[state=closed]:zoom-out-95 gencl:data-[state=open]:zoom-in-95",
    "gencl:z-50 gencl:w-full gencl:gap-4 gencl:rounded-lg",
    "gencl:bg-white gencl:p-6 gencl:shadow-lg gencl:duration-200 gencl:sm:max-w-lg",
  ],
  {
    variants: {
      variant: {
        default: [
          "gencl:fixed gencl:bottom-0 gencl:sm:bottom-auto gencl:sm:top-1/2 gencl:left-1/2 gencl:sm:-translate-y-1/2",
          "gencl:-translate-x-1/2",
        ],
        top: ["gencl:fixed gencl:top-8 gencl:left-1/2 gencl:-translate-x-1/2"],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  showClose?: boolean;
  bgBlur?: boolean;
}

function DialogContent({
  className,
  children,
  variant = "default",
  showClose = true,
  bgBlur = false,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={cn({ "gencl:backdrop-blur-lg": bgBlur })} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className={cn(
              "gencl:absolute gencl:top-4 gencl:right-4 gencl:rounded-xs",
              "gencl:opacity-70 gencl:transition-opacity gencl:hover:opacity-100",
              "gencl:disabled:pointer-events-none gencl:[&_svg]:pointer-events-none",
              "gencl:[&_svg]:shrink-0 gencl:[&_svg:not([class*=size-])]:size-4",
              "gencl:cursor-pointer"
            )}
          >
            <XIcon className="gencl:stroke-secondary-600" />
            <span className="gencl:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "gencl:flex gencl:flex-col gencl:gap-2 gencl:text-center gencl:border-b gencl:border-secondary-150",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "gencl:flex gencl:flex-col-reverse gencl:gap-2 gencl:sm:flex-row gencl:sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
