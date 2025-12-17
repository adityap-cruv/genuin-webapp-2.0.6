"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, getGenclStyles } from "@genuin/ui/lib/utils";

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

const popoverContentVariants = cva(
  "gencl:z-50 gencl:origin-(--radix-popover-content-transform-origin) gencl:rounded-md gencl:outline-hidden gencl:data-[state=open]:animate-in gencl:data-[state=closed]:animate-out gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0 gencl:data-[side=bottom]:slide-in-from-top-2 gencl:data-[side=left]:slide-in-from-right-2 gencl:data-[side=right]:slide-in-from-left-2 gencl:data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      theme: {
        light:
          "gencl:bg-white gencl:border gencl:border-border gencl:w-72 gencl:p-4 gencl:shadow-md",
        dark: "gencl:bg-secondary-900 gencl:border gencl:border-secondary-700 gencl:text-white gencl:w-72 gencl:p-4 gencl:shadow-md",
        auth:
          "gencl:border gencl:border-border gencl:w-72 gencl:p-4 gencl:shadow-md",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

const popoverArrowVariants = cva("gencl:z-50 gencl:size-3.5 gencl:w-5", {
  variants: {
    theme: {
      light: "gencl:fill-white",
      dark: "gencl:bg-secondary-900 gencl:border-secondary-700",
      auth : "gencl:fill-white"
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
> &
  VariantProps<typeof popoverContentVariants> & {
    showArrow?: boolean;
    customBackgroundColor?: string;
  };
function PopoverClose({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  theme,
  customBackgroundColor,
  showArrow = false,
  children,
  ...props
}: PopoverContentProps) {
  // const customColorStyle = customBackgroundColor
  //   ? { backgroundColor: customBackgroundColor }
  //   : {};
  const arrowStyle = customBackgroundColor
    ? { fill: customBackgroundColor }
    : {};

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        // style={customColorStyle}
        className={cn("gen-sdk-class gen-sdk-root-portal",popoverContentVariants({ theme }), className)}
        {...props}
      >
        {children}
        {showArrow && (
          <PopoverPrimitive.Arrow
            style={arrowStyle}
            className={cn(popoverArrowVariants({ theme }))}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent, PopoverAnchor };
