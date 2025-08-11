"use client";
import { cn } from "@genuin/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";
import { useWindowSize } from "usehooks-ts";

import { TopBar } from "@genuin/components/organisms/top-bar";
import { MobileSidebar, SideBar } from "@genuin/components/organisms/side-bar";
import { TOP_BAR_HEIGHT } from "@genuin/components/lib/constants";
import { Toaster } from "@genuin/ui/toaster";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useEmbedContext } from "@genuin/components/context/embed";

type BaseLayoutProps = ComponentProps<"section">;

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
  className,
  ...restProps
}: BaseLayoutProps) {
  const { height } = useWindowSize();
  const { isMobile } = useDeviceDetectMediaQuery();
  const pathname = usePathname();
  const { searchParams, getSearchParams } = useSearchParams();
  const { layoutConfig } = useEmbedConfigs();
  const embedDetails = useEmbedContext();

  // Use rootElement height if available, otherwise fall back to window height
  const effectiveHeight = embedDetails.rootElement?.offsetHeight ?? height;

  // Update shouldUseDarkTheme when searchParams or pathname changes
  const [shouldUseDarkTheme, setShouldUseDarkTheme] = useState(false);

  useEffect(() => {
    const isDarkTheme =
      topBarDarkVariantRoutes.includes(pathname) ||
      (pathname.includes("/community") && getSearchParams("feed") === "1") ||
      pathname.includes("/video");

    setShouldUseDarkTheme(isDarkTheme);
  }, [pathname, searchParams]);

  // Calculate height value with fallback that accounts for top bar
  const calculatedHeight =
    typeof effectiveHeight === "number" && !isNaN(effectiveHeight)
      ? shouldUseDarkTheme && isMobile
        ? effectiveHeight
        : layoutConfig.showNavigationBar
          ? effectiveHeight - TOP_BAR_HEIGHT
          : effectiveHeight
      : layoutConfig.showNavigationBar
        ? `calc(100vh - ${TOP_BAR_HEIGHT}px)`
        : "100vh";

  return (
    <>
      {layoutConfig.showNavigationBar && (
        <TopBar
          theme={shouldUseDarkTheme && isMobile ? "dark" : "light"}
          style={{ zIndex: 9 }}
          search={undefined}
        />
      )}
      {!layoutConfig.showNavigationBar && isMobile && (
        <div className="gencl:fixed gencl:top-4 gencl:left-4 gencl:z-10">
          <MobileSidebar
            theme={shouldUseDarkTheme && isMobile ? "dark" : undefined}
          />
        </div>
      )}
      <main
        className="gencl:sm:flex gencl:overflow-clip"
        style={{
          height: calculatedHeight,
        }}
      >
        {!isMobile && layoutConfig.showSideBar && (
          <SideBar className="gencl:sm:block! gencl:hidden" />
        )}
        <section
          className={cn(
            "gencl:w-full gencl:flex-grow gencl:!h-full gencl:relative",
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
