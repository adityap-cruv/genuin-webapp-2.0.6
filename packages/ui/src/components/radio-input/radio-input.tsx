"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";

interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  className?: string;
}

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={cn("gencl:grid gencl:gap-2", className)}
      {...props}
    />
  );
}

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  className?: string;
}

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "gencl:border-secondary-300 gencl:aspect-square gencl:h-5 gencl:w-5 gencl:rounded-full gencl:border",
        "gencl:focus:outline-none gencl:focus-visible:ring-1 gencl:focus-visible:ring-offset-1",
        "gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50",
        "gencl:data-[state=checked]:border-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="gencl:flex gencl:items-center gencl:justify-center gencl:transition-all gencl:duration-500">
        <div className="gencl:flex-center gencl:h-5 gencl:w-5 gencl:rounded-full gencl:bg-primary gencl:text-white">
          <Check className="gencl:h-4 gencl:w-4 gencl:stroke-white" />
        </div>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

interface RadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function RadioItem({
  className,
  value,
  label,
  disabled,
  ...props
}: RadioItemProps) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:cursor-pointer gencl:items-center gencl:justify-between",
        disabled && "gencl:cursor-not-allowed gencl:opacity-50",
        className
      )}
      {...props}
    >
      <label
        htmlFor={`radio-${value}`}
        className="gencl:cursor-pointer gencl:text-body-1-bold"
      >
        {label}
      </label>
      <RadioGroupItem
        className="gencl:transition-all gencl:duration-500"
        value={value}
        disabled={disabled}
        id={`radio-${value}`}
      />
    </div>
  );
}

export { RadioGroup, RadioGroupItem, RadioItem };
