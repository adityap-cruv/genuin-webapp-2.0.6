"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "src/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "gencl:peer gencl:data-[state=checked]:bg-primary gencl:data-[state=unchecked]:bg-secondary-500 gencl:focus-visible:border-  gencl:focus-visible:ring-ring/50  gencl:inline-flex gencl:h-[1.15rem] gencl:w-8 gencl:shrink-0 gencl:items-center gencl:rounded-full gencl:border gencl:border-transparent gencl:shadow-xs gencl:transition-all gencl:outline-none gencl:focus-visible:ring-[3px] gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50 gencl:cursor-pointer",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "gencl:bg-white gencl:pointer-events-none gencl:block gencl:size-4 gencl:rounded-full gencl:ring-0 gencl:transition-transform gencl:data-[state=checked]:translate-x-[calc(100%-2px)] gencl:data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
