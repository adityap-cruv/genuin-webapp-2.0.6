"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          [
            // Base styles
            "gencl:z-50 gencl:w-60 gencl:bg-white gencl:rounded-md gencl:p-4 gencl:shadow-mdc gencl:outline-hidden",
            // Transform origin
            "gencl:origin-(--radix-popover-content-transform-origin) gencl:border-secondary-150 gencl:border",
            // Animation states
            "data-[state=open]:gencl:animate-in data-[state=closed]:gencl:animate-out",
            "data-[state=open]:gencl:fade-in-0 data-[state=closed]:gencl:fade-out-0",
            "data-[state=open]:gencl:zoom-in-95 data-[state=closed]:gencl:zoom-out-95",
            // Side-specific slide animations
            "data-[side=bottom]:gencl:slide-in-from-top-2",
            "data-[side=left]:gencl:slide-in-from-right-2",
            "data-[side=right]:gencl:slide-in-from-left-2",
            "data-[side=top]:gencl:slide-in-from-bottom-2",
          ],
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
