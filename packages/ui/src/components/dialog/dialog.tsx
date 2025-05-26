"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "src/lib/utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
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

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "gencl:data-[state=open]:animate-in gencl:data-[state=closed]:animate-out",
          "gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0",
          "gencl:data-[state=closed]:zoom-out-95 gencl:data-[state=open]:zoom-in-95 ",
          "gencl:fixed gencl:top-1/2 gencl:left-1/2 gencl:-translate-y-1/2",
          "gencl:-translate-x-1/2 gencl:z-50 gencl:grid gencl:w-full",
          "gencl:gap-4 gencl:rounded-lg ",
          "gencl:bg-white gencl:p-6 gencl:shadow-lg gencl:duration-200 gencl:sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "gencl:absolute gencl:top-4 gencl:right-4 gencl:rounded-xs",
            " gencl:opacity-70 gencl:transition-opacity hover:gencl:opacity-100 ",
            "gencl:disabled:pointer-events-none gencl:[&_svg]:pointer-events-none",
            " gencl:[&_svg]:shrink-0 gencl:[&_svg:not([class*=size-])]:size-4"
          )}
        >
          <XIcon />
          <span className="gencl:sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "gencl:flex gencl:flex-col gencl:gap-2 gencl:text-center",
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
        "gencl:flex gencl:flex-col-reverse gencl:gap-2 sm:gencl:flex-row sm:gencl:justify-end",
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
