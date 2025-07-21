"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "src/lib/utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "gencl:h-10 gencl:data-[placeholder]:text-secondary-600 gencl:[&_svg:not([class*=text-])]:text-muted-foreground gencl:aria-invalid:border-red gencl:flex gencl:w-full gencl:items-center gencl:justify-between gencl:gap-2 gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-transparent gencl:px-3 gencl:py-2 gencl:text-sm gencl:whitespace-nowrap gencl:shadow-xs gencl:transition-[color,box-shadow] gencl:outline-none gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50 gencl:*:data-[slot=select-value]:line-clamp-1 gencl:*:data-[slot=select-value]:flex gencl:*:data-[slot=select-value]:items-center gencl:*:data-[slot=select-value]:gap-2 gencl:[&_svg]:pointer-events-none gencl:[&_svg]:shrink-0 gencl:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="gencl:size-4 gencl:text-secondary-600" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/* Dropdown Menu Component */
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "gencl:bg-popover gencl:text-popover-foreground gencl:data-[state=open]:animate-in gencl:data-[state=closed]:animate-out gencl:data-[state=closed]:fade-out-0 gencl:data-[state=open]:fade-in-0 gencl:data-[state=closed]:zoom-out-95 gencl:data-[state=open]:zoom-in-95 gencl:data-[side=bottom]:slide-in-from-top-2 gencl:data-[side=left]:slide-in-from-right-2 gencl:data-[side=right]:slide-in-from-left-2 gencl:data-[side=top]:slide-in-from-bottom-2 gencl:relative gencl:z-50 gencl:max-h-(--radix-select-content-available-height) gencl:min-w-[8rem] gencl:origin-(--radix-select-content-transform-origin) gencl:overflow-x-hidden gencl:overflow-y-auto gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:shadow-md gencl:bg-white",
          position === "popper" &&
            "gencl:data-[side=bottom]:translate-y-1 gencl:data-[side=left]:-translate-x-1 gencl:data-[side=right]:translate-x-1 gencl:data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "gencl:p-1",
            position === "popper" &&
              "gencl:h-[var(--radix-select-trigger-height)] gencl:w-full gencl:min-w-[var(--radix-select-trigger-width)] gencl:scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "gencl:text-body-2-medium gencl:px-2 gencl:py-1.5 gencl:text-secondary-600",
        className
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  showTickMark = true,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & {
  showTickMark?: boolean;
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "gencl:focus:bg-accent gencl:focus:text-accent-foreground gencl:[&_svg:not([class*=text-])]:text-muted-foreground gencl:relative gencl:flex gencl:w-full gencl:cursor-default gencl:items-center gencl:gap-2 gencl:rounded-lg gencl:py-1.5 gencl:pr-8 gencl:pl-2 gencl:text-sm gencl:outline-hidden gencl:select-none gencl:data-[disabled]:pointer-events-none gencl:data-[disabled]:opacity-50 gencl:[&_svg]:pointer-events-none gencl:[&_svg]:shrink-0 gencl:[&_svg:not([class*=size-])]:size-4 gencl:*:[span]:last:flex gencl:*:[span]:last:items-center gencl:*:[span]:last:gap-2 gencl:hover:bg-secondary-50 gencl:data-[state=checked]:bg-secondary-100",
        className
      )}
      {...props}
    >
      {showTickMark && (
        <span className="gencl:absolute gencl:right-2 gencl:flex gencl:size-3.5 gencl:items-center gencl:justify-center">
          <SelectPrimitive.ItemIndicator>
            <CheckIcon className="gencl:size-4" />
          </SelectPrimitive.ItemIndicator>
        </span>
      )}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "gencl:bg-border gencl:pointer-events-none gencl:-mx-1 gencl:my-1 gencl:h-px",
        className
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "gencl:flex gencl:cursor-default gencl:items-center gencl:justify-center gencl:py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="gencl:size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "gencl:flex gencl:cursor-default gencl:items-center gencl:justify-center gencl:py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="gencl:size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
