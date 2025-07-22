"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

type AccordionItemProps = {
  className?: string;
  value: string;
} & React.ComponentProps<typeof AccordionPrimitive.Item>;

type AccordionTriggerProps = {
  className?: string;
  children: React.ReactNode;
  openIcon?: React.ReactNode;
  closedIcon?: React.ReactNode;
} & React.ComponentProps<typeof AccordionPrimitive.Trigger>;

type AccordionContentProps = {
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof AccordionPrimitive.Content>;

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({ className, value, ...props }: AccordionItemProps) => (
  <AccordionPrimitive.Item className={className} value={value} {...props} />
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = ({
  className,
  children,
  openIcon,
  closedIcon,
  ...props
}: AccordionTriggerProps) => (
  <AccordionPrimitive.Header className="gencl:flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "gencl:flex gencl:flex-1 gencl:items-center gencl:justify-between gencl:py-4 gencl:transition-all hover:gencl:underline gencl:[&[data-state=open]>svg]:rotate-180 gencl:cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:transition-transform gencl:duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionContentProps) => (
  <AccordionPrimitive.Content
    className="gencl:overflow-hidden gencl:transition-all data-[state=closed]:gencl:animate-accordion-up gencl:data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("gencl:pb-4 gencl:pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
