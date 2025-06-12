"use client";

import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@genuin/ui/components/dialog";
import { cn } from "@genuin/ui/lib/utils";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:overflow-hidden gencl:rounded-md",
        className
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="gencl:sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="gencl:overflow-hidden gencl:p-0">
        <Command
          className={cn(
            "gencl:**:data-[slot=command-input-wrapper]:h-12 gencl:[&_[cmdk-group-heading]]:px-2",
            " gencl:[&_[cmdk-group-heading]]:font-medium gencl:[&_[cmdk-group]]:px-2",
            " gencl:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 gencl:[&_[cmdk-input-wrapper]_svg]:h-5",
            " gencl:[&_[cmdk-input-wrapper]_svg]:w-5 gencl:[&_[cmdk-input]]:h-12",
            " gencl:[&_[cmdk-item]]:px-2 gencl:[&_[cmdk-item]]:py-3 gencl:[&_[cmdk-item]_svg]:h-5 gencl:[&_[cmdk-item]_svg]:w-5"
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="gencl:flex gencl:h-9 gencl:items-center gencl:gap-2 gencl:border-b gencl:px-3"
    >
      <SearchIcon className="gencl:size-4 gencl:shrink-0 gencl:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "gencl:flex gencl:h-10 gencl:w-full gencl:rounded-md",
          " gencl:py-3 gencl:text-sm gencl:outline-hidden gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "gencl:max-h-[300px] gencl:scroll-py-1 gencl:overflow-x-hidden gencl:overflow-y-auto",
        className
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="gencl:py-6"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "gencl:overflow-hidden gencl:p-1 gencl:[&_[cmdk-group-heading]]:px-2",
        " gencl:[&_[cmdk-group-heading]]:py-1.5 gencl:[&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("gencl:bg-border gencl:-mx-1 gencl:h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "gencl:data-[selected=true]:text-accent-foreground",
        "[&_svg:not([class*='text-'])]:gencl:text-muted-foreground",
        "gencl:relative gencl:flex gencl:cursor-default gencl:items-center gencl:gap-2",
        "gencl:rounded-sm gencl:px-2 gencl:py-1.5 gencl:text-sm gencl:outline-hidden",
        "gencl:select-none gencl:data-[disabled=true]:pointer-events-none gencl:data-[disabled=true]:opacity-50",
        "[&_svg]:gencl:pointer-events-none [&_svg]:gencl:shrink-0",
        "[&_svg:not([class*='size-'])]:gencl:size-4",
        className
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "gencl:text-muted-foreground gencl:ml-auto gencl:text-xs gencl:tracking-widest",
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
