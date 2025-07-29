import { CtaButtons } from "./cta-buttons";
import { BrandLogo } from "@genuin/components/molecules/brand";
import { BrandSlogan } from "@genuin/components/molecules/brand";
import { cn } from "@genuin/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@genuin/ui/sheet";
import { AlignJustifyIcon, XIcon } from "@genuin/ui/icons";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { SideBar } from "../side-bar";
import { useRef } from "react";

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

const mobileSidebarVariants = cva("", {
  variants: {
    theme: {
      light:
        "gencl:bg-white gencl:rounded-full gencl:border-secondary-150 gencl:border gencl:p-2 ",
      dark: "gencl:bg-black/40! gencl:p-2 gencl:rounded-full",
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

type MobileSidebarProps = React.ComponentProps<typeof SheetTrigger> &
  VariantProps<typeof mobileSidebarVariants>;

function MobileSidebar({ theme, className, ...restProps }: MobileSidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseSheet = () => {
    closeButtonRef.current?.click();
  };

  return (
    <Sheet>
      <SheetTrigger
        className={cn(mobileSidebarVariants({ theme }), className)}
        {...restProps}
      >
        <AlignJustifyIcon size="md" theme={theme} />
      </SheetTrigger>
      <SheetContent side="left" hideCloseIcon>
        <div className="gencl:py-5 gencl:px-4 gencl:flex gencl:justify-between gencl:items-center gencl:bg-secondary-50">
          <BrandLogo
            logoType="brand_web_logo"
            className="gencl:max-w-40 gencl:h-7 gencl:sm:w-full!"
            onClick={handleCloseSheet}
          />
          <SheetClose ref={closeButtonRef}>
            <XIcon size="md" theme="secondary" />
          </SheetClose>
        </div>
        <SideBar variant="mobile" onItemClick={handleCloseSheet} />
      </SheetContent>
    </Sheet>
  );
}
