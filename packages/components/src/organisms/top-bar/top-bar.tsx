import { CtaButtons } from "./cta-buttons";
import { BrandLogo } from "@genuin/components/molecules/brand";
import { BrandSlogan } from "@genuin/components/molecules/brand";
import { cn } from "@genuin/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { MobileSidebar } from "../side-bar";

const topbarVariants = cva(
  "playback-speed-class gencl:h-16 gencl:w-full gencl:flex gencl:px-4 gencl:sm:px-6! gencl:items-center gencl:justify-between",
  {
    variants: {
      theme: {
        light: "gencl:bg-white gencl:border-b gencl:border-secondary-150",
        // dark mode is only for mobile view in case of dark top-bar grows to desktop it will  be light mode.
        dark: "gencl:bg-transparent gencl:fixed gencl:top-0 gencl:sm:relative! gencl:sm:border-b gencl:sm:border-secondary-150 gencl:sm:bg-none gencl:bg-linear-to-b gencl:from-black/40 gencl:to-black/0",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

type TopBarProps = React.ComponentProps<"div"> & {
  search: ReactNode;
} & VariantProps<typeof topbarVariants>;

export function TopBar({
  className,
  search,
  theme,
  ...restProps
}: TopBarProps) {
  const { isMobile } = useDeviceDetectMediaQuery();
  return (
    <div className={cn(className, topbarVariants({ theme }))} {...restProps}>
      <div className="gencl:flex gencl:items-center">
        {isMobile && (
          <MobileSidebar
            theme={theme}
            className="gencl:mr-2 gencl:sm:hidden gencl:block"
          />
        )}
        <BrandLogo className="gencl:h-9 gencl:sm:h-12! gencl:w-9 gencl:sm:w-full! gencl:rounded-full gencl:sm:rounded-none!" />
      </div>
      {!isMobile && <BrandSlogan className="gencl:hidden gencl:sm:block!" />}
      <CtaButtons theme={theme} />
    </div>
  );
}
