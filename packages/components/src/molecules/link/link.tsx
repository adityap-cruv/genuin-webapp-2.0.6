import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<"a">;

// todo: adapt NextJS Link component if needed and also make sure to handle for the web-sdk routing as well.
export function Link({ className, href, children, ...restProps }: LinkProps) {
  if (!href) {
    return children;
  }

  return (
    <a
      href={href}
      className={cn("gencl:cursor-pointer", className)}
      {...restProps}
    >
      {children}
    </a>
  );
}
