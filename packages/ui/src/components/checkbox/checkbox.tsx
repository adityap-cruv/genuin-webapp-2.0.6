"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const checkboxVariants = cva(
  "gencl:peer gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:rounded-sm gencl:border gencl:transition-all",
  {
    variants: {
      variant: {
        default: "gencl:border-primary gencl:data-[state=checked]:bg-primary",
        secondary:
          "gencl:border-secondary-300 gencl:data-[state=checked]:bg-secondary-600",
      },
      size: {
        sm: "gencl:h-3 gencl:w-3",
        md: "gencl:h-4 gencl:w-4",
        lg: "gencl:h-5 gencl:w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type CheckboxPropsType = React.ComponentProps<
  typeof CheckboxPrimitive.Root
> &
  VariantProps<typeof checkboxVariants>;

function Checkbox({
  className,
  variant,
  size = "md",
  ...props
}: CheckboxPropsType) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        checkboxVariants({ variant, size }),
        "gencl:focus-visible:ring-ring",
        "gencl:ring-offset-background",
        "gencl:focus-visible:outline-none",
        "gencl:focus-visible:ring-2",
        "gencl:focus-visible:ring-offset-2",
        "gencl:disabled:cursor-not-allowed",
        "gencl:disabled:opacity-50",
        "gencl:data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "gencl:flex gencl:items-center gencl:justify-center",
          "gencl:text-white"
        )}
      >
        <Check
          className={cn("gencl:stroke-monochrome-white", {
            "gencl:h-2 gencl:w-2": size === "sm",
            "gencl:h-3 gencl:w-3": size === "md",
            "gencl:h-4 gencl:w-4": size === "lg",
          })}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

Checkbox.displayName = "Checkbox";

export { Checkbox, checkboxVariants };
