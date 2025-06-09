import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

export type InputProps = React.ComponentProps<"input">;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "gencl:flex gencl:h-10 gencl:w-full gencl:rounded-2 gencl:border-2 gencl:px-3 gencl:py-2",
        "gencl:invalid:border-supplementary-red gencl:focus-visible:border-monochrome-6",
        "gencl:focus-visible:outline-none gencl:focus-visible:ring-offset-0 gencl:disabled:cursor-not-allowed",
        "gencl:disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
