"use client";

import { ChevronFirstIcon, LoginIcon, QRIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { lazy, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useAuthRedirectHandler } from "@genuin/components/hooks/use-auth-redirect-handler";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { SIDEBAR_WIDTH_VAR } from "@genuin/components/lib/constants";
import { StandardWallLoginGate } from "@genuin/components/molecules/auth-login-gate/auth-login-gate";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { SidebarActions, SideBarBecomeCreator } from "@genuin/components/molecules/sidebar";
import { PoweredByGenuin } from "@genuin/components/molecules/sidebar";
import { Category } from "@genuin/components/molecules/sidebar/category";
import { Recent } from "@genuin/components/molecules/sidebar/recent";

const AuthenticationModal = lazy(() =>
  import("@genuin/components/organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);

/** `collapsed` is internal state, not a caller-supplied variant, so it is not offered here. */
type SideBarProps = ComponentProps<"aside"> & {
  variant?: "default" | "mobile";
  onItemClick?: () => void;
};

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";

const sidebarVariants = cva(
  // Sits above the body-level expand-view overlay (measured at `z-index: 1000`) so the rail stays
  // visible and hoverable even in the frame before that overlay is re-inset to the rail's width.
  "gencl:relative gencl:z-[1001] gencl:h-full gencl:bg-white gencl:flex gencl:flex-col gencl:overflow-hidden",
  {
    variants: {
      variant: {
        default: "gencl:border-r gencl:xl:!w-60 gencl:border-secondary-150 gencl:w-16 gencl:shrink-0",
        // Same icon rail the `default` variant falls back to below `xl`, but pinned at every width.
        collapsed: "gencl:border-r gencl:border-secondary-150 gencl:w-16 gencl:shrink-0",
        mobile: "gencl:w-full gencl:xl:block!",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function SideBar({ variant, className, onItemClick, ...restProps }: SideBarProps) {
  const { brandDetails } = useBaseContext();
  const { layoutConfig } = useEmbedConfigs();
  // `isLargeDesktop` is the same 1280px threshold as the rail's `xl:` classes.
  const { isLargeDesktop } = useDeviceDetectMediaQuery();
  const showBecomeACreator = brandDetails.show_become_creator ?? true;

  // Every desktop route is collapsible; the rail opens collapsed and the toggle below pins it open.
  const isCollapsible = variant !== "mobile";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage(SIDEBAR_COLLAPSED_KEY, true);
  // Hovering peeks at the full rail; the toggle pins that open so it survives the mouse leaving.
  // Below `xl` there is nothing to peek at — the rail is already the widest the sidebar gets.
  const [isPeeking, setIsPeeking] = useState(false);
  const canPeek = isCollapsible && isLargeDesktop;
  // Peeking widens the `<aside>` itself, so it stays a flex item of `<main>` and the `<section>`
  // beside it gives up the space — the same reflow the responsive `xl:` rail has always done.
  const isCollapsed = isCollapsible && isSidebarCollapsed && !(canPeek && isPeeking);
  const resolvedVariant = isCollapsed ? "collapsed" : variant;

  // Publish the rail's width so overlays rendered outside this layout (the expand-view portal is
  // appended to <body>, so it is not a sibling that flexbox can shrink) can inset themselves by it.
  // Absent — on a publisher's page, where there is no side bar — the fallback keeps them full-bleed.
  const railWidth = isCollapsed || !isLargeDesktop ? "64px" : "240px";
  useEffect(() => {
    if (variant === "mobile") return;
    document.documentElement.style.setProperty(SIDEBAR_WIDTH_VAR, railWidth);

    // The SDK builds its overlay host in its own bundle and never re-resolves the variable once the
    // host exists, so pin the geometry on each host directly as well. The observer catches hosts
    // created later — the expand view only appends one when the reader opens it.
    const insetOverlayHosts = () => {
      document.querySelectorAll<HTMLElement>("[data-genuin-overlay-host]").forEach((host) => {
        host.style.setProperty("left", railWidth, "important");
        host.style.setProperty("width", `calc(100% - ${railWidth})`, "important");
      });
    };
    insetOverlayHosts();
    const observer = new MutationObserver(insetOverlayHosts);
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(SIDEBAR_WIDTH_VAR);
    };
  }, [railWidth, variant]);

  return (
    <aside
      className={cn(sidebarVariants({ variant: resolvedVariant }), className)}
      onMouseEnter={canPeek ? () => setIsPeeking(true) : undefined}
      onMouseLeave={canPeek ? () => setIsPeeking(false) : undefined}
      {...restProps}>
      <div
        className={cn(
          "gencl:flex-1 gencl:h-full gencl:overflow-y-auto gencl:pb-16",
          // Room for the extra toggle row pinned to the bottom.
          isCollapsible && "gencl:xl:pb-28"
        )}>
        <SidebarActions
          brandConfiguredTerms={brandDetails.terms_and_condition ?? ""}
          brandConfiguredPrivacy={brandDetails.privacy_policy ?? ""}
          variant={resolvedVariant}
          onItemClick={onItemClick}
          showSearch={!layoutConfig.showNavigationBar}
        />
        {!layoutConfig.showNavigationBar && <ProxyComponent variant={resolvedVariant} />}
        {/* Its own cva is bypassed by hardcoded classes, so the rail hides it via className. */}
        {showBecomeACreator && (
          <SideBarBecomeCreator variant={variant} className={cn(isCollapsed && "gencl:hidden! gencl:xl:hidden!")} />
        )}
        <Category variant={resolvedVariant} onItemClick={onItemClick} />
        <Recent variant={resolvedVariant} onItemClick={onItemClick} />
      </div>
      <div className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:bg-white">
        {isCollapsible && (
          <button
            type="button"
            data-testid="sidebar-collapse-toggle"
            // Reflects the pinned preference, not the peek, so a click always matches the icon.
            aria-expanded={!isSidebarCollapsed}
            aria-label={isSidebarCollapsed ? "Keep sidebar expanded" : "Collapse sidebar"}
            onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
            // Below `xl` the rail cannot expand at all, so the toggle would be a no-op control.
            className="gencl:hidden gencl:xl:flex gencl:w-full gencl:items-center gencl:justify-center gencl:border-t gencl:border-secondary-150 gencl:p-4 gencl:cursor-pointer gencl:hover:bg-secondary-50">
            <ChevronFirstIcon className={cn(isSidebarCollapsed && "gencl:rotate-180")} />
          </button>
        )}
        {!isCollapsed && <PoweredByGenuin variant={variant} />}
      </div>
    </aside>
  );
}

const proxyComponentVariant = cva("gencl:border-b gencl:border-secondary-100 gencl:px-3 gencl:py-4", {
  variants: {
    variant: {
      default: "gencl:flex gencl:flex-col gencl:[&_p]:hidden gencl:[&_p]:xl:block",
      collapsed: "gencl:flex gencl:flex-col gencl:[&_p]:hidden",
      mobile: "gencl:flex gencl:flex-col gencl:[&_p]:block",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// TODO: Adopt sidebar actions to use the new proxy componet, haven't done it as it required some extra efforts and some refactoring was needed.
function ProxyComponent({ variant }: VariantProps<typeof proxyComponentVariant>) {
  const { brandDetails } = useBaseContext();
  const { authenticationStatus } = useAuthContext();
  const isAuthenticated = authenticationStatus === "authenticated";
  const showLogin = brandDetails.web_cta === "login" || brandDetails.web_cta === "both";
  const showApp = brandDetails.web_cta === "app" || brandDetails.web_cta === "both";
  const loginClickHandler = useAuthRedirectHandler({ action: "login" });

  return (
    <div className={cn(proxyComponentVariant({ variant }))}>
      {!isAuthenticated && showLogin && (
        <StandardWallLoginGate
          loginClickHandler={loginClickHandler}
          asChild={false}
          modalClassName="gencl:w-full"
          wrapperClassName="gencl:w-full gencl:cursor-pointer">
          <ProxyItem icon={<LoginIcon size="lg" />} text="Log in" />
        </StandardWallLoginGate>
      )}
      {showApp && (
        <SafeSuspense fallback={<ProxyItem icon={<QRIcon size="lg" />} text="Get app" />} errorFallback={null}>
          <AuthenticationModal asChild={false} customStep="GET_APP" className="gencl:w-full">
            <ProxyItem icon={<QRIcon size="lg" />} text="Get app" />
          </AuthenticationModal>
        </SafeSuspense>
      )}
    </div>
  );
}

function ProxyItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="gencl:flex gencl:items-center gencl:gap-4 gencl:cursor-pointer gencl:px-3 gencl:py-2 gencl:hover:bg-secondary-50 gencl:rounded-xl">
      {icon}
      <p className="gencl:text-body-1-medium">{text}</p>
    </div>
  );
}
