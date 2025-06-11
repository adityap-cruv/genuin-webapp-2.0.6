"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "gencl:relative gencl:flex gencl:w-full gencl:touch-none gencl:items-center gencl:select-none gencl:data-[disabled]:opacity-50 gencl:data-[orientation=vertical]:h-full gencl:data-[orientation=vertical]:min-h-44 gencl:data-[orientation=vertical]:w-auto gencl:data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "gencl:bg-secondary-100 gencl:relative gencl:grow gencl:overflow-hidden gencl:rounded-full gencl:data-[orientation=horizontal]:h-1.5 gencl:data-[orientation=horizontal]:w-full gencl:data-[orientation=vertical]:h-full gencl:data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "gencl:bg-primary gencl:absolute gencl:data-[orientation=horizontal]:h-full gencl:data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="gencl:border-primary gencl:bg-primary gencl:ring-ring/50 gencl:block gencl:size-4 gencl:shrink-0 gencl:rounded-full gencl:border gencl:shadow-sm gencl:transition-[color,box-shadow] gencl:hover:ring-4 gencl:hover:text-primary gencl:focus-visible:ring-4 gencl:focus-visible:outline-hidden gencl:focus:border-primary gencl:disabled:pointer-events-none gencl:disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
