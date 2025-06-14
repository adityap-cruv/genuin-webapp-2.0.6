import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

// TODO: think about composite theme for icon as well.
const buttonVariants = cva(
  "gencl:inline-flex gencl:items-center gencl:px-4 gencl:text-body-0-semi-bold gencl:justify-center gencl:hover:cursor-pointer gencl:gap-2 gencl:whitespace-nowrap gencl:rounded-md gencl:transition-[color,box-shadow] gencl:disabled:pointer-events-none gencl:disabled:opacity-50 [&_svg]:gencl:pointer-events-none [&_svg:not([class*='size-'])]:gencl:size-4 gencl:shrink-0 [&_svg]:gencl:shrink-0 gencl:outline-none gencl:has-[>svg:first-child]:pl-2",
  {
    variants: {
      variant: {
        default: "",
        icon: "",
        rounded: "gencl:rounded-full",
      },
      theme: {
        primary:
          "gencl:bg-primary gencl:text-white! gencl:shadow-xs gencl:hover:bg-primary-600 gencl:[&_svg]:stroke-white",
        secondary:
          "gencl:bg-secondary-50 gencl:text-black! gencl:hover:bg-secondary-100",
        outline: "gencl:border gencl:border-secondary-200 gencl:bg-white",
        text: "gencl:text-primary",
        custom: "",
        navigation:
          "gencl:p-0 gencl:size-12! gencl:rounded-full! gencl:flex-center gencl:bg-secondary-800 gencl:text-white gencl:backdrop-blur-sm gencl:hover:bg-secondary-600 gencl:border-0 gencl:transition-all gencl:duration-200 [&_svg]:gencl:size-5",
      },
      size: {
        sm: "gencl:h-9 gencl:rounded-md gencl:gap-1.5 gencl:text-body-1-semi-bold gencl:has-[>svg]:px-2.5",
        md: "gencl:h-10",
        lg: "gencl:h-12 gencl:has-[>svg]:px-4",
      },
      shape: {
        default: "gencl:rounded-md",
        pill: "gencl:rounded-full",
      },
    },
    compoundVariants: [
      {
        shape: "pill",
        size: "sm",
        class: "gencl:text-body-2-semi-bold gencl:py-1 gencl:px-3 gencl:h-auto",
      },
      {
        shape: "pill",
        size: "md",
        class:
          "gencl:text-body-2-semi-bold gencl:py-1.5 gencl:px-4 gencl:h-auto",
      },
      {
        shape: "pill",
        size: "lg",
        class: "gencl:text-body-2-semi-bold gencl:py-2 gencl:px-5 gencl:h-auto",
      },
    ],
    defaultVariants: {
      size: "md",
      theme: "primary",
      variant: "default",
      shape: "default",
    },
  }
);

export type ButtonPropsType = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  theme,
  size,
  shape,
  variant,
  asChild = false,
  ...props
}: ButtonPropsType) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ theme, size, shape, variant }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonPropsType as ButtonProps };
