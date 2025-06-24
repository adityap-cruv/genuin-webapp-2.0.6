"use client";

import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner, toast } from "sonner";
import { CircleCheck, X } from "lucide-react";
import { XIcon } from "@genuin/ui/icons";

type ToastVariant = "success" | "error";

interface ToastBodyProps {
  message: string;
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

const showCustomToast = (message: string, variant: ToastVariant) => {
  toast.custom((id) => (
    <div className="gencl:bg-white gencl:text-black gencl:flex gencl:items-center gencl:justify-between gencl:gap-4 gencl:p-4 gencl:rounded-lg gencl:shadow-lg gencl:w-sm gencl:max-w-sm">
      <div className="gencl:flex gencl:items-center gencl:gap-2">
        {variant === "success" ? (
          <CircleCheck className="gencl:size-4 gencl:fill-success-status gencl:text-white" />
        ) : (
          <X className="gencl:size-3 gencl:bg-error-status gencl:text-white gencl:rounded-full gencl:p-0.5" />
        )}
        <span className="gencl:text-body-0-semi-bold gencl:text-secondary-900">
          {message}
        </span>
      </div>
      <XIcon
        onClick={() => toast.dismiss(id)}
        className="gencl:size-3 gencl:text-secondary-600 hover:gencl:text-black gencl:cursor-pointer"
      />
    </div>
  ));
};

const ToastSuccess = ({ message }: ToastBodyProps) => showCustomToast(message, "success");

const ToastError = ({ message }: ToastBodyProps) => showCustomToast(message, "error");

const Toast = {
  Success: ToastSuccess,
  Error: ToastError,
};

export { Toaster, Toast };
