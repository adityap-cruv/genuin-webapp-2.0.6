"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "src/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "gencl:inline-flex gencl:w-fit gencl:items-center gencl:justify-center gencl:rounded-lg",
        className
      )}
      {...props}
    />
  );
}

// TODO: How to make border bottom rounded on both edges.
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "gencl:data-[state=active]:border-b-2 gencl:border-b-2 gencl:border-transparent gencl:data-[state=active]:border-primary ",
        "gencl:inline-flex gencl:h-[calc(100%-1px)] gencl:flex-1 gencl:items-center gencl:justify-center ",
        "gencl:gap-1.5 gencl:p-2 gencl:whitespace-nowrap gencl:transition-[color,box-shadow]",
        "gencl:disabled:pointer-events-none gencl:disabled:opacity-50 gencl:[&_svg]:pointer-events-none",
        "gencl:[&_svg]:shrink-0 gencl:[&_svg:not([class*=\'size-\'])]:size-4",
        "gencl:text-body-1-medium! gencl:text-secondary-900 gencl:data-[state=active]:text-body-1-semi-bold! gencl:translate-y-0.25",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "gencl:flex-1 gencl:border-t gencl:border-secondary-300 gencl:box-border gencl:pt-6 gencl:outline-none",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
