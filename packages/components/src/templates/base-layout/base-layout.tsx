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
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { SideBar } from "@genuin/components/organisms/side-bar";
import { TopBar } from "@genuin/components/organisms/top-bar";

type BaseLayoutProps = ComponentProps<"section"> & {
  showToaster?: boolean;
};

type GenuinWindow = Window & {
  genuin?: {
    onInternal?: (event: string, listener: (payload: unknown) => void) => (() => void) | void;
  };
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
  const { getContentTypeState } = useSheetState();
  const linkoutState = getContentTypeState("linkouts");
  const isLinkoutExpanded = linkoutState === "panel-view" || linkoutState === "full-view";

  // Update shouldUseDarkTheme when searchParams or pathname changes
  const [shouldUseDarkTheme, setShouldUseDarkTheme] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  // The SDK's expand view is a full-screen player with its own chrome; the site bar must not
  // sit on top of it on mobile, where there is no room for both.
  const [isExpandViewOpen, setIsExpandViewOpen] = useState(false);

  useEffect(() => {
    const isDarkTheme =
      topBarDarkVariantRoutes.includes(pathname) ||
      // The article reader gets the SAME bar as Home/Popular/Latest. `/article/<slug>` is a
      // dynamic path, so it is matched by prefix rather than listed above.
      pathname.startsWith("/article") ||
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

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let retry: number | undefined;
    let attempts = 0;

    const register = () => {
      if (cancelled) return;
      const genuin = (window as GenuinWindow).genuin;
      if (!genuin?.onInternal) {
        // Placements mount after this layout, so the SDK global can appear well after mount.
        if (attempts++ < 40) retry = window.setTimeout(register, 200);
        return;
      }

      // Internal SDK events arrive as `{ type, payload, ... }`; accept the bare boolean too so
      // this keeps working against older bundles during a rolling SDK deployment.
      const off: unknown = genuin.onInternal("onExpandViewChanged", (raw: unknown) => {
        const expanded = typeof raw === "boolean" ? raw : (raw as { payload?: unknown } | null | undefined)?.payload;
        if (typeof expanded === "boolean") setIsExpandViewOpen(expanded);
      });
      if (typeof off === "function") unsubscribe = off as () => void;
    };

    register();

    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      unsubscribe?.();
    };
  }, []);

  // An expand view belongs to the page that opened it. Navigating away unmounts the placement,
  // so the closing `false` never arrives and the flag stays stuck `true` — which hid the mobile
  // top bar for the rest of the session (open a Feed View on Home, tap through to an article,
  // and the article had no header). Clearing it on every route change is the reset.
  useEffect(() => {
    setIsExpandViewOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile has room for either the site bar or a full-bleed player surface, never both.
          An ad or an expanded linkout takes the viewport (2.0.6), and so does a mobile expand
          view — that last one is why `isExpandViewOpen` is tracked here at all. */}
      {!(isAdPlaying && isMobile) &&
        !(isLinkoutExpanded && isMobile) &&
        !(isExpandViewOpen && isMobile) &&
        (layoutConfig.showNavigationBar || layoutConfig.showBackAndCloseButton) && (
          <TopBar theme={shouldUseDarkTheme && isMobile ? "dark" : "light"} style={{ zIndex: 60 }} variant={variant} />
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
