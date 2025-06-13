import { CtaButtons } from "./cta-buttons";
import { BrandLogo } from "@molecules/brand";
import { BrandSlogan } from "@molecules/brand";
import { cn } from "@genuin/ui/utils";
import type { ReactNode } from "react";

type TopBarProps = React.ComponentProps<"div"> & { search: ReactNode };

export function TopBar({ className, search, ...restProps }: TopBarProps) {
  return (
    <div
      className={cn(
        "gencl:h-16 gencl:w-full gencl:flex gencl:px-6 gencl:items-center gencl:justify-between",
        className
      )}
      {...restProps}
    >
      <BrandLogo className="gencl:h-full gencl:py-2 gencl:object-cover" />
      <BrandSlogan />
      <div className="gencl:flex gencl:justify-between gencl:gap-2.5">
        {search}
        <CtaButtons />
      </div>
    </div>
  );
}
