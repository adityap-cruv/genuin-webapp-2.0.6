"use client";
import { cn } from "@genuin/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";

import { TopBar } from "@genuin/components/organisms/top-bar";
import { SideBar } from "@genuin/components/organisms/side-bar";
import { Toaster } from "@genuin/ui/toaster";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { cva, VariantProps } from "class-variance-authority";

type BaseLayoutProps = ComponentProps<"section">;

const baseLayoutVariant = cva("", {
  variants: {
    variant: {
      "embed-expand-view": "",
    },
  },
});

/**
 * routes that should have dark top bar variant.
 */
const topBarDarkVariantRoutes = [
  buildPageUrl({ type: "home" }),
  buildPageUrl({ type: "popular" }),
  buildPageUrl({ type: "latest" }),
];

export function BaseLayout({
  children,
  variant,
  className,
  ...restProps
}: BaseLayoutProps & VariantProps<typeof baseLayoutVariant>) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const pathname = usePathname();
  const { searchParams, getSearchParams } = useSearchParams();
  const { layoutConfig } = useEmbedConfigs();

  // Update shouldUseDarkTheme when searchParams or pathname changes
  const [shouldUseDarkTheme, setShouldUseDarkTheme] = useState(false);

  useEffect(() => {
    const isDarkTheme =
      topBarDarkVariantRoutes.includes(pathname) ||
      (pathname.includes("/community") && getSearchParams("feed") === "1") ||
      pathname.includes("/video");

    setShouldUseDarkTheme(isDarkTheme);
  }, [pathname, searchParams]);

  return (
    <>
      {(layoutConfig.showNavigationBar ||
        layoutConfig.showBackAndCloseButton) && (
        <TopBar
          theme={shouldUseDarkTheme && isMobile ? "dark" : "light"}
          style={{ zIndex: 9 }}
          variant={variant}
        />
      )}
      <main
        className={cn(
          "gencl:sm:flex gencl:overflow-clip gencl:relative",
          layoutConfig.showNavigationBar && !isMobile
            ? "gencl:h-[calc(100%_-_64px)]"
            : "gencl:h-full"
        )}
        // style={{
        //   height: calculatedHeight,
        // }}
        suppressHydrationWarning
      >
        {!isMobile && layoutConfig.showSideBar && (
          <SideBar className="gencl:sm:block! gencl:hidden" />
        )}
        <section
          className={cn(
            "gencl:w-full gencl:flex-grow gencl:!h-full gencl:relative",
            variant === "embed-expand-view" && "gencl:xl:px-15",
            className
          )}
          {...restProps}
        >
          {children}
        </section>
        <Toaster />
      </main>
    </>
  );
}
