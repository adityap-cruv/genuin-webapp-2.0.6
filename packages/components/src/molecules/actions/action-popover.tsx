"use client";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/components";
import { XIcon } from "@genuin/ui/icons";
import { ReactNode, useEffect, useState } from "react";
import { Link } from "../link";

interface ActionPopoverProps {
  /**
   * Trigger element to show the popover
   */
  children: ReactNode;
  /**
   * Content to display after the sign-in/sign-up text
   */
  content: string;
  /**
   * URL parameters to append to sign-in/sign-up URLs
   */
  params: string;
  /**
   * Initial open state of the popover
   */
  initialOpen?: boolean;
  /**
   * Auto-close timeout in milliseconds (default: 2400)
   */
  autoCloseTimeout?: number;
  /**
   * Callback when popover open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The preferred side of the anchor to render against (default: "top")
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Whether to show the arrow pointing to the anchor (default: true)
   */
  showArrow?: boolean;
  /**
   * The preferred alignment against the anchor (default: "end")
   */
  align?: "start" | "center" | "end";
  /**
   * Background color for the popover (default: "#5786FF")
   */
  backgroundColor?: string;
  /**
   * Additional CSS class name for the popover content
   */
  contentClassName?: string;
}

export function ActionPopover({
  children,
  content,
  params,
  initialOpen = false,
  autoCloseTimeout = 2400,
  onOpenChange,
  side = "top",
  showArrow = true,
  align = "end",
  backgroundColor = "#5786FF",
  contentClassName = "",
}: ActionPopoverProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const embedDetails = useSafeEmbedContext();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
        onOpenChange?.(false);
      }, autoCloseTimeout);
    }
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [isOpen, autoCloseTimeout, onOpenChange]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        showArrow={showArrow}
        align={align}
        customBackgroundColor={backgroundColor}
        className={`gencl:border-none gencl:bg-[${backgroundColor}] gencl:duration-700 gencl:p-4 gencl:w-screen gencl:sm:max-w-sm ${contentClassName}`}
        onInteractOutside={() => handleOpenChange(false)}
      >
        <div className="gencl:flex gencl:justify-between gencl:items-center gencl:px-2">
          <p className="gencl:text-white gencl:text-body-1-normal gencl:tracking-wide">
            <Link
              href={
                embedDetails?.embedData?.authInfo?.signInUrl +
                `${embedDetails?.embedData?.authInfo?.signInUrl?.includes("?") ? "&" : "?"}${params}`
              }
              className="gencl:font-bold gencl:underline"
            >
              Sign-in
            </Link>
            <span className="gencl:text-white"> or </span>
            <Link
              href={
                embedDetails?.embedData?.authInfo?.signUpUrl +
                `${embedDetails?.embedData?.authInfo?.signUpUrl?.includes("?") ? "&" : "?"}${params}`
              }
              className="gencl:font-bold gencl:underline"
            >
              sign-up
            </Link>
            <span className="gencl:text-white"> {content}</span>
          </p>
          <XIcon
            onClick={() => handleOpenChange(false)}
            className="gencl:cursor-pointer"
            theme="dark"
            size="sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
