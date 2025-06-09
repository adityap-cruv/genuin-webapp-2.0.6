"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

const tooltipContentVariants = cva(
  "gencl:z-50 gencl:w-fit gencl:origin-(--radix-tooltip-content-transform-origin) gencl:rounded-md gencl:px-3 gencl:py-1.5",
  {
    variants: {
      theme: {
        light: "gencl:bg-secondary-300 gencl:text-white",
        dark: "gencl:bg-secondary-800 gencl:text-white",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

const tooltipArrowVariants = cva(
  "gencl:z-50 gencl:size-2.5 gencl:translate-y-[calc(-50%_-_2px)] gencl:rotate-45 gencl:rounded-[2px]",
  {
    variants: {
      theme: {
        light: "gencl:bg-secondary-300 gencl:fill-secondary-300",
        dark: "gencl:bg-secondary-800 gencl:fill-secondary-800",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

type TooltipContentProps = React.ComponentProps<
  typeof TooltipPrimitive.Content
> &
  VariantProps<typeof tooltipContentVariants>;

//TODO: somehow animation are not working in tooltip content open and close.
// tooltip content stays on screen if we enable animations fix the issue.

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  theme,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(className, tooltipContentVariants({ theme }))}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(tooltipArrowVariants({ theme }))}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
