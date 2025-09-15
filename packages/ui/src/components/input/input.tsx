import * as React from "react";
import { cn } from "@genuin/ui/lib/utils";
import { Loader } from "../loader";

export type InputProps = React.ComponentProps<"input"> & {
  icon?: React.ReactNode;
  iconPlacement?: "left" | "right";
  isLoading?: boolean;
};

function Input({
  className,
  type,
  icon,
  iconPlacement = "left",
  disabled,
  isLoading,
  ...props
}: InputProps) {
  return (
    <div className="gencl:relative gencl:flex gencl:items-center gencl:w-full">
      {icon && (
        <span
          className={cn(
            "gencl:absolute gencl:text-secondary-400",
            iconPlacement === "left" ? "gencl:left-3" : "gencl:right-3",
            disabled && "gencl:opacity-50"
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "gencl:flex gencl:h-10 gencl:text-secondary-900 gencl:text-body-1-medium gencl:w-full gencl:px-3 gencl:py-2",
          "gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50",
          "gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:p-2 gencl:pl-3",
          "gencl:aria-[invalid=true]:border-red!", // Apply red border when aria-invalid is true
          "gencl:focus:border-secondary-600 gencl:focus:border-1 gencl:outline-none", // Add border color and hide default outline on focus
          // Adjust left, right padding to make room for icon
          {
            "gencl:pl-10 gencl:pr-3": icon && iconPlacement === "left",
            "gencl:pr-10 gencl:pl-3": icon && iconPlacement === "right",
            "gencl:px-3": !icon,
          },
          className
        )}
        disabled={disabled}
        {...props}
      />
      {isLoading && (
        <div className="gencl:absolute gencl:right-2">
          <Loader size={"sm"} />
        </div>
      )}
    </div>
  );
}

export { Input };
