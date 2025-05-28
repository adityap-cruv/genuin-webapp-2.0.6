import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "gencl:inline-flex gencl:items-center gencl:px-4 gencl:text-body-0-semi-bold gencl:justify-center gencl:hover:cursor-pointer gencl:gap-2 gencl:whitespace-nowrap gencl:rounded-md gencl:transition-[color,box-shadow] gencl:disabled:pointer-events-none gencl:disabled:opacity-50 [&_svg]:gencl:pointer-events-none [&_svg:not([class*='size-'])]:gencl:size-4 gencl:shrink-0 [&_svg]:gencl:shrink-0 gencl:outline-none",
  {
    variants: {
      theme: {
        primary:
          "gencl:bg-primary gencl:text-white! gencl:shadow-xs gencl:hover:bg-primary-600",
        secondary: "gencl:bg-secondary-50 gencl:hover:bg-secondary-100",
        outline: "gencl:border gencl:border-secondary-200 gencl:bg-white",
        text: "",
      },
      size: {
        sm: "gencl:h-9 gencl:rounded-md gencl:gap-1.5 gencl:text-body-1-semi-bold gencl:has-[>svg]:px-2.5",
        md: "gencl:h-10",
        lg: "gencl:h-12 gencl:rounded-md  gencl:has-[>svg]:px-4",
      },
    },
    defaultVariants: {
      size: "md",
      theme: "primary",
    },
  }
);

type ButtonPropsType = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  theme = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonPropsType) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ theme, size }), className, "")}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonPropsType as ButtonProps };
