"use client";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/components";
import { XIcon } from "@genuin/ui/icons";
import { memo, ReactNode, useEffect, useState } from "react";
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

export const ActionPopover = memo(function ActionPopover({
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

  // Parse URL parameters into a structured object
  const parseUrlParameters = (paramString: string) => {
    return paramString
      .split("&")
      .map((pair) => pair.split("="))
      .reduce<Record<string, string>>((acc, [key, value]) => {
        if (key) acc[key] = value || "";
        return acc;
      }, {});
  };

  // Generate authentication URL based on configuration
  const generateAuthUrl = (
    baseUrl: string | Function | undefined,
    queryParams: Record<string, string>,
    rawParamString: string
  ): string | Function => {
    if (!baseUrl) return "";

    if (typeof baseUrl === "function") {
      return () => {
        return baseUrl(
          queryParams.videoSlug,
          queryParams.action,
          queryParams.commentId
        );
      };
    }

    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${rawParamString}`;
  };

  const parsedParameters = parseUrlParameters(params);
  const authInfo = embedDetails?.embedData?.authInfo;

  // Generate auth URLs efficiently - avoid multiple function calls if URLs are functions
  const signInUrl: string | Function = generateAuthUrl(
    authInfo?.signInUrl,
    parsedParameters,
    params
  );
  const signUpUrl: string | Function = generateAuthUrl(
    authInfo?.signUpUrl,
    parsedParameters,
    params
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        showArrow={showArrow}
        align={align}
        customBackgroundColor={backgroundColor}
        className={`gencl:border-none gencl:bg-transparent! gencl:duration-700 gencl:p-0 gencl:w-screen gencl:shadow-none gencl:sm:max-w-sm ${contentClassName}`}
        onInteractOutside={() => handleOpenChange(false)}
      >
        <div
          className="gencl:flex gencl:justify-between gencl:items-center gencl:p-4 gencl:bg-red gencl:mx-4 gencl:rounded-md"
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <p className="gencl:text-white gencl:text-body-1-normal gencl:tracking-wide">
            <span
              className="gencl:font-bold gencl:underline"
              onClick={(e) => {
                e.stopPropagation();
                window.location.assign(
                  typeof signInUrl === "function" ? signInUrl() : signInUrl
                );
              }}
            >
              Sign-in
            </span>
            <span className="gencl:text-white"> or </span>
            <span
              className="gencl:font-bold gencl:underline"
              onClick={(e) => {
                e.stopPropagation();
                window.location.assign(
                  typeof signUpUrl === "function" ? signUpUrl() : signUpUrl
                );
              }}
            >
              sign-up
            </span>
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
});
