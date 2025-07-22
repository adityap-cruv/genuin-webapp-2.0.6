"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "src/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 gencl:fixed gencl:inset-0 gencl:z-50 gencl:bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  hideCloseIcon = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  hideCloseIcon?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "gencl:bg-white gencl:data-[state=open]:animate-in gencl:data-[state=closed]:animate-out gencl:fixed gencl:z-50 gencl:flex gencl:flex-col gencl:gap-4 gencl:shadow-lg gencl:transition gencl:ease-in-out gencl:data-[state=closed]:duration-300 gencl:data-[state=open]:duration-500",
          side === "right" &&
            "gencl:data-[state=closed]:slide-out-to-right gencl:data-[state=open]:slide-in-from-right gencl:inset-y-0 gencl:right-0 gencl:h-full gencl:w-3/4 gencl:sm:max-w-sm",
          side === "left" &&
            "gencl:data-[state=closed]:slide-out-to-left gencl:data-[state=open]:slide-in-from-left gencl:inset-y-0 gencl:left-0 gencl:h-full gencl:w-3/4 gencl:sm:max-w-sm",
          side === "top" &&
            "gencl:data-[state=closed]:slide-out-to-top gencl:data-[state=open]:slide-in-from-top gencl:inset-x-0 gencl:top-0 gencl:h-auto",
          side === "bottom" &&
            "gencl:data-[state=closed]:slide-out-to-bottom gencl:data-[state=open]:slide-in-from-bottom gencl:inset-x-0 gencl:bottom-0 gencl:h-auto",
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseIcon && (
          <SheetPrimitive.Close className="gencl:absolute gencl:top-4 gencl:right-4 gencl:rounded-xs gencl:opacity-70 gencl:transition-opacity gencl:hover:opacity-100 gencl:disabled:pointer-events-none">
            <XIcon className="gencl:size-4" />
            <span className="gencl:sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "gencl:flex gencl:flex-col gencl:gap-1.5 gencl:p-4",
        className
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "gencl:mt-auto gencl:flex gencl:flex-col gencl:gap-2 gencl:p-4",
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
