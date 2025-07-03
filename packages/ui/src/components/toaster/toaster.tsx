"use client";

import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner, toast } from "sonner";
import { CircleCheck, X } from "lucide-react";
import { XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

type ToastVariant = "success" | "error";

interface ToastBodyProps {
  message: string;
  description?: string;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster gencl:group"
      style={
        {
          "--normal-bg": "var(--white)",
          "--normal-text": "var(--black)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

const showCustomToast = (
  message: string,
  description: string | undefined,
  variant: ToastVariant
) => {
  toast.custom((id) => (
    <div className="gencl:bg-white gencl:text-black gencl:flex gencl:items-center gencl:border gencl:border-secondary-150 gencl:justify-between gencl:gap-4 gencl:p-4 gencl:rounded-lg gencl:shadow-lg gencl:w-sm gencl:max-w-sm">
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
        className="gencl:size-4 gencl:shrink-0 gencl:text-secondary-600 hover:gencl:text-black gencl:cursor-pointer"
      />
    </div>
  ));
};

const ToastSuccess = ({ message, description }: ToastBodyProps) =>
  showCustomToast(message, description, "success");

const ToastError = ({ message, description }: ToastBodyProps) =>
  showCustomToast(message, description, "error");

const Toast = {
  Success: ToastSuccess,
  Error: ToastError,
};

export { Toaster, Toast };
