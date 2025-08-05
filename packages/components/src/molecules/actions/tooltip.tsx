import { Button } from "@genuin/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@genuin/ui/tooltip";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { type ComponentProps, type ReactNode } from "react";

const tooltipVariants = cva("", {
  variants: {
    variant: {
      light:
        "gencl:border-secondary-200 gencl:border gencl:hover:bg-secondary-200 ",
      dark: "gencl:bg-secondary-900 gencl:hover:bg-secondary-800",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

// TooltipAction component definition
type TooltipActionProps = {
  icon: ReactNode;
  tooltipText: string;
  disableTooltip?: boolean;
} & VariantProps<typeof tooltipVariants> &
  ComponentProps<typeof TooltipTrigger>;

export function TooltipAction({
  icon,
  tooltipText,
  variant,
  className,
  disableTooltip = false,
  onClick,
  ...restProps
}: TooltipActionProps) {
  if (disableTooltip) {
    return (
      <Button
        theme={"custom"}
        className={cn(
          tooltipVariants({ variant }),
          "gencl:hover:cursor-pointer ",
          "gencl:h-12 gencl:p-0 gencl:w-12 gencl:flex gencl:items-center gencl:justify-center  gencl:rounded-full",
          "gencl:[&_svg]:w-8 gencl:[&_svg]:h-8",
          className
        )}
        onClick={onClick}
        {...restProps}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          tooltipVariants({ variant }),
          "gencl:hover:cursor-pointer",
          "gencl:h-12 gencl:w-12 gencl:flex gencl:items-center gencl:justify-center  gencl:rounded-full",
          "gencl:[&_svg]:w-8 gencl:[&_svg]:h-8",
          className
        )}
        onClick={onClick}
        {...restProps}
        asChild
      >
        <div
          className={cn(
            tooltipVariants({ variant }),
            "gencl:hover:cursor-pointer ",
            "gencl:h-12 gencl:p-0 gencl:w-12 gencl:flex gencl:items-center gencl:justify-center  gencl:rounded-full",
            "gencl:[&_svg]:w-8 gencl:[&_svg]:h-8",
            className
          )}
        >
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent theme={variant ?? "light"} side="right">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
