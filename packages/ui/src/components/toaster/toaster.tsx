"use client";

import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner, toast } from "sonner";

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

const toastError = (message: string, options?: Parameters<typeof toast>[1]) =>
  toast(message, {
    ...options,
    className:
      "gencl:bg-red-100! gencl:text-red! gencl:border-red! gencl:border!",
    description: options?.description,
  });

export { Toaster, toast, toastError };
