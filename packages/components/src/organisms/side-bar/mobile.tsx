"use client";
import { useRef } from "react";
import { SideBar } from "../side-bar";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@genuin/ui/sheet";
import { AlignJustifyIcon, XIcon } from "@genuin/ui/icons";
import { cva, VariantProps } from "class-variance-authority";
import { BrandLogo } from "@genuin/components/molecules/brand";
import { cn } from "@genuin/ui/lib/utils";

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

export function MobileSidebar({
  theme,
  className,
  ...restProps
}: MobileSidebarProps) {
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
            className="gencl:max-w-40 gencl:h-7! gencl:sm:w-full!"
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
