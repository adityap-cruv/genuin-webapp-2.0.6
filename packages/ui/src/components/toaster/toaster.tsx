"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner, toast } from "sonner";
import { CircleCheck, X } from "lucide-react";
import { useDeviceDetection } from "@genuin/ui/hooks/use-device-detection";
import { cn, getGenclStyles } from "@genuin/ui/lib/utils";
import { XIcon } from "@genuin/ui/icons";

type ToastVariant = "success" | "error";

interface ToastBodyProps {
  message: string;
  description?: string;
  position?: ToasterProps["position"];
  bgColor?: string;
}

const Toaster = ({ position, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { isMobile } = useDeviceDetection();
  const [currentPosition, setCurrentPosition] = useState<
    ToasterProps["position"]
  >(position || (isMobile ? "top-center" : "bottom-right"));

  useEffect(() => {
    const handler = (e: CustomEvent<ToasterProps["position"]>) =>
      setCurrentPosition(e.detail);
    window.addEventListener("toastPositionChange", handler as EventListener);
    return () =>
      window.removeEventListener(
        "toastPositionChange",
        handler as EventListener
      );
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster gencl:group"
      position={currentPosition}
      expand={isMobile}
      style={
        {
          "--normal-bg": "var(--gencl-white)",
          "--normal-text": "var(--gencl-black)",
          "--normal-border": "var(--gencl-border)",
          "--width": isMobile ? "min(calc(100% - 32px), 380px)" : "auto",
          ...getGenclStyles(),
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
  position?: ToasterProps["position"],
  bgColor?: string
) => {
  if (position) {
    window.dispatchEvent(
      new CustomEvent("toastPositionChange", { detail: position })
    );
  }
  toast.custom((id) => (
    <div
      className={cn(
        "gencl:flex gencl:items-start gencl:border gencl:border-secondary-150 gencl:justify-between gencl:gap-4 gencl:p-4 gencl:rounded-lg gencl:shadow-lg gencl:w-full gencl:sm:w-sm! sm:gencl:max-w-sm! sm:gencl:mt-0!",
        bgColor ? "gencl:text-black" : "gencl:bg-white gencl:text-black"
      )}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:gap-2",
          description && "gencl:items-start"
        )}
      >
        {variant === "success" ? (
          <CircleCheck className="gencl:size-5 gencl:shrink-0 gencl:fill-success-status gencl:text-white" />
        ) : (
          <X className="gencl:size-4 gencl:shrink-0 gencl:bg-error-status gencl:text-white gencl:rounded-full gencl:p-0.5" />
        )}
        <div className="gencl:text-body-0-semi-bold gencl:text-secondary-900 gencl:flex gencl:flex-col gencl:gap-2">
          <p>{message}</p>
          {description && (
            <p className="gencl:text-body-1-medium">{description}</p>
          )}
        </div>
      </div>
      <XIcon
        onClick={() => toast.dismiss(id)}
        className="gencl:size-4 gencl:shrink-0 gencl:text-secondary-600 hover:gencl:text-black gencl:cursor-pointer gencl:mt-1"
      />
    </div>
  ));
};

const ToastSuccess = ({
  message,
  description,
  position,
  bgColor,
}: ToastBodyProps) =>
  showCustomToast(message, description, "success", position, bgColor);

const ToastError = ({
  message,
  description,
  position,
  bgColor,
}: ToastBodyProps) =>
  showCustomToast(message, description, "error", position, bgColor);

const Toast = { Success: ToastSuccess, Error: ToastError };

export { Toaster, Toast };
