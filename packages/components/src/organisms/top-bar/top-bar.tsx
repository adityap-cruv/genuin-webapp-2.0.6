import { CtaButtons } from "./cta-buttons";
import { BrandLogo } from "@genuin/components/molecules/brand";
import { BrandSlogan } from "@genuin/components/molecules/brand";
import { cn } from "@genuin/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { MobileSidebar } from "../side-bar";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Button } from "@genuin/ui/components";
import { ArrowLeftIcon, XIcon } from "@genuin/ui/icons";
import { useRouter } from "@genuin/components/hooks/use-router";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useCallback } from "react";

const topbarVariants = cva(
  "playback-speed-class gencl:h-16 gencl:w-full gencl:flex gencl:px-4 gencl:sm:px-6! gencl:items-center gencl:justify-between",
  {
    variants: {
      variant: {
        "embed-expand-view": "gencl:xl:px-21!",
      },
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

type TopBarProps = React.ComponentProps<"div"> & {} & VariantProps<
    typeof topbarVariants
  >;

export function TopBar({
  className,
  variant,
  theme,
  ...restProps
}: TopBarProps) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const { layoutConfig } = useEmbedConfigs();
  const embedDetails = useSafeEmbedContext();
  const router = useRouter();
  const closeExpandView = useCallback(() => {
    if (!embedDetails) return;

    embedDetails.goBackToPreviousPlayerType();
  }, []);

  const navBarItems = (
    <div className="gencl:w-full gencl:flex gencl:items-center gencl:justify-between">
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

  if (
    (layoutConfig.showBackAndCloseButton && router.canGoBack()) ||
    layoutConfig.showCloseButton
  ) {
    const buttonTheme = isMobile
      ? theme === "dark"
        ? "overlay"
        : "outline"
      : "outline";
    const buttonShape = isMobile ? "circle" : "square";
    return (
      <div
        className={cn(
          className,
          topbarVariants({ theme, variant }),
          layoutConfig.showNavigationBar
            ? "gencl:gap-3"
            : "gencl:justify-start gencl:gap-3"
        )}
        {...restProps}
      >
        {router.canGoBack() && (
          <Button onClick={router.back} theme={buttonTheme} shape={buttonShape}>
            <ArrowLeftIcon theme={theme} />
          </Button>
        )}
        <div
          className={cn(
            "gencl:justify-between gencl:w-full gencl:flex gencl:items-center"
          )}
        >
          {layoutConfig.showNavigationBar ? (
            navBarItems
          ) : isMobile ? (
            <MobileSidebar theme={theme} />
          ) : (
            <div></div>
          )}
          {layoutConfig.showCloseButton ? (
            <Button
              onClick={closeExpandView}
              theme={buttonTheme}
              shape={buttonShape}
            >
              <XIcon theme={theme} />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    );
  }

  if (layoutConfig.showNavigationBar) {
    return (
      <div
        className={cn(className, topbarVariants({ theme, variant }))}
        {...restProps}
      >
        {navBarItems}
      </div>
    );
  }
}
