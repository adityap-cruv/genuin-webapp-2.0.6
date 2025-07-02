import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

export type InputProps = React.ComponentProps<"input">;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "gencl:flex gencl:h-10 gencl:text-secondary-900 gencl:text-body-1-medium gencl:w-full gencl:px-3 gencl:py-2",
        "gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50",
        "gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:p-2 gencl:pl-3",
        "gencl:aria-[invalid=true]:border-red!", // Apply red border when aria-invalid is true
        "gencl:focus:border-secondary-600 gencl:focus:border-1 gencl:outline-none", // Add border color and hide default outline on focus
        className
      )}
      {...props}
    />
  );
}

export { Input };
