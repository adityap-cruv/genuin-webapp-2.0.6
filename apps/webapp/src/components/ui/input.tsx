import * as React from "react";

import { cn } from "@lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "placeholder:text-monochrome-7 invalid:border-supplementary-red focus-visible:border-monochrome-6 flex h-10 w-full rounded-[4px] border-2 px-3 py-2 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
