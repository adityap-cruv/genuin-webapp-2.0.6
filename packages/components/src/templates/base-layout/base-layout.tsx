"use client";
import { Toaster } from "@genuin/ui";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { useEffect, useState, type ComponentProps } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { SideBar } from "@genuin/components/organisms/side-bar";
import { TopBar } from "@genuin/components/organisms/top-bar";

type BaseLayoutProps = ComponentProps<"section"> & {
  showToaster?: boolean;
};

const _baseLayoutVariant = cva("", {
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
}: BaseLayoutProps & VariantProps<typeof _baseLayoutVariant>) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const pathname = usePathname();
  const { searchParams, getSearchParams } = useSearchParams();
  const { layoutConfig } = useEmbedConfigs();

  // Update shouldUseDarkTheme when searchParams or pathname changes
  const [shouldUseDarkTheme, setShouldUseDarkTheme] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  useEffect(() => {
    const isDarkTheme =
      topBarDarkVariantRoutes.includes(pathname) ||
      (pathname.includes("/community") && getSearchParams("feed") === "1") ||
      pathname.includes("/video");

    setShouldUseDarkTheme(isDarkTheme);
  }, [pathname, searchParams]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsAdPlaying(document.documentElement.classList.contains("gen-ad-playing"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {!(isAdPlaying && isMobile) && (layoutConfig.showNavigationBar || layoutConfig.showBackAndCloseButton) && (
        <TopBar theme={shouldUseDarkTheme && isMobile ? "dark" : "light"} style={{ zIndex: 9 }} variant={variant} />
      )}
      <main
        className={cn(
          "gencl:sm:flex gencl:overflow-clip gencl:relative gencl:bg-white",
          (layoutConfig.showNavigationBar || layoutConfig.showBackAndCloseButton) && !isMobile
            ? "gencl:h-[calc(100%_-_64px)]"
            : "gencl:h-full"
        )}
        // style={{
        //   height: calculatedHeight,
        // }}
        suppressHydrationWarning>
        {!isMobile && layoutConfig.showSideBar && <SideBar className="gencl:sm:block! gencl:hidden" />}
        <section
          className={cn(
            // min-w-0 lets this flex item shrink to the available width instead of growing
            // to its content's intrinsic size; without it, horizontally-scrolling children
            // (e.g. carousels) overflow and get clipped by <main>'s overflow-clip.
            "gencl:w-full gencl:min-w-0 gencl:flex-grow gencl:!h-full gencl:relative",
            variant === "embed-expand-view" && "gencl:xl:px-15",
            className
          )}
          {...restProps}>
          {children}
        </section>
        <Toaster />
      </main>
    </>
  );
}
