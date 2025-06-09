"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@genuin/ui/lib/utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "gencl:bg-white gencl:data-[state=open]:animate-in data-[state=closed]:animate-out gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0 gencl:data-[state=closed]:zoom-out-95 gencl:data-[state=open]:zoom-in-95 gencl:data-[side=bottom]:slide-in-from-top-2 gencl:data-[side=left]:slide-in-from-right-2 gencl:data-[side=right]:slide-in-from-left-2 gencl:data-[side=top]:slide-in-from-bottom-2 gencl:z-50 gencl:w-80 gencl:origin-(--radix-hover-card-content-transform-origin) gencl:rounded-2xl gencl:border gencl:border-secondary-150 gencl:p-4 gencl:shadow-md gencl:outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
