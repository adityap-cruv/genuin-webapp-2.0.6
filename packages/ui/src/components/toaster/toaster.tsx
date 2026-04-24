"use client";

import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner, toast } from "sonner";
import { X } from "lucide-react";
import { useDeviceDetection } from "@genuin/ui/hooks/use-device-detection";
import { cn, getGenclStyles } from "@genuin/ui/lib/utils";
import { IHeartCheckIcon, XIcon } from "@genuin/ui/icons";

type ToastVariant = "success" | "error";

interface ToastBodyProps {
  message: string;
  description?: string;
  isIheart?: boolean;
}

const Toaster = ({ position, style, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { isMobile } = useDeviceDetection();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster gencl:group"
      position={position ?? (isMobile ? "top-center" : "bottom-right")}
      expand={isMobile}
      style={
        {
          "--normal-bg": "var(--gencl-white)",
          "--normal-text": "var(--gencl-black)",
          "--normal-border": "var(--gencl-border)",
          "--width": isMobile ? "min(calc(100% - 32px), 380px)" : "100%",
          ...getGenclStyles(),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

const showCustomToast = (
  message: string,
  description: string | undefined,
  variant: ToastVariant,
  isIheart?: boolean,
) => {
  toast.custom((id) => (
    <div
      className={cn(
        "gencl:flex gencl:items-start gencl:justify-between gencl:gap-4 gencl:rounded-lg gencl:shadow-lg gencl:w-full!",
        isIheart
          ? "gencl:text-black gencl:bg-[#ACE7C0] gencl:p-3"
          : "gencl:bg-white gencl:text-black gencl:border gencl:border-secondary-150 gencl:p-4 gencl:sm:w-sm! gencl:sm:max-w-sm! sm:gencl:mt-0!",
      )}
      tabIndex={-1}
    >
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:gap-2",
          description && "gencl:items-start",
        )}
      >
        {variant === "success" ? (
          <div
            className={cn(
              "gencl:size-5 gencl:rounded-2xl gencl:flex gencl:justify-center gencl:items-center gencl:shrink-0",
              isIheart
                ? "gencl:bg-[#46815A]!"
                : "gencl:bg-success-status gencl:border gencl:border-white",
            )}
          >
            <IHeartCheckIcon
              className={cn(
                "gencl:shrink-0 gencl:fill-white",
                isIheart ? "gencl:size-4" : "gencl:size-3",
              )}
            />
          </div>
        ) : (
          <X className="gencl:size-4 gencl:shrink-0 gencl:bg-error-status gencl:text-white gencl:rounded-full gencl:p-0.5" />
        )}
        <div className="gencl:text-body-0-semi-bold gencl:text-secondary-900 gencl:flex gencl:flex-col gencl:gap-2">
          <p className="gencl:m-0!">{message}</p>
          {description && (
            <p className="gencl:text-body-1-medium gencl:m-0!">{description}</p>
          )}
        </div>
      </div>
      <XIcon
        onClick={(event) => {
          toast.dismiss(id);
          event.stopPropagation();
        }}
        className="gencl:size-4 gencl:shrink-0 gencl:text-secondary-600 hover:gencl:text-black gencl:cursor-pointer gencl:mt-1"
      />
    </div>
  ));
};

const ToastSuccess = ({ message, description, isIheart }: ToastBodyProps) =>
  showCustomToast(message, description, "success", isIheart);

const ToastError = ({ message, description, isIheart }: ToastBodyProps) =>
  showCustomToast(message, description, "error", isIheart);

const Toast = { Success: ToastSuccess, Error: ToastError };

export type { ToasterProps };
export { Toaster, Toast };
