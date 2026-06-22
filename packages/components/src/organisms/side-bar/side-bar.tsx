"use client";

import { LoginIcon, QRIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { lazy } from "react";

import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
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

type SideBarProps = ComponentProps<"aside"> &
  VariantProps<typeof sidebarVariants> & {
    onItemClick?: () => void;
  };

const sidebarVariants = cva(
  "gencl:relative gencl:h-full gencl:bg-white gencl:flex gencl:flex-col gencl:overflow-hidden",
  {
    variants: {
      variant: {
        default: "gencl:border-r gencl:xl:!w-60 gencl:border-secondary-150 gencl:w-16 gencl:shrink-0",
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
  const showBecomeACreator = brandDetails.show_become_creator ?? true;

  return (
    <aside className={cn(sidebarVariants({ variant }), className)} {...restProps}>
      <div className="gencl:flex-1 gencl:h-full gencl:overflow-y-auto gencl:pb-16">
        <SidebarActions
          brandConfiguredTerms={brandDetails.terms_and_condition ?? ""}
          brandConfiguredPrivacy={brandDetails.privacy_policy ?? ""}
          variant={variant}
          onItemClick={onItemClick}
          showSearch={!layoutConfig.showNavigationBar}
        />
        {!layoutConfig.showNavigationBar && <ProxyComponent variant={variant} />}
        {showBecomeACreator && <SideBarBecomeCreator variant={variant} />}
        <Category variant={variant} onItemClick={onItemClick} />
        <Recent variant={variant} onItemClick={onItemClick} />
      </div>
      <div className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0">
        <PoweredByGenuin variant={variant} />
      </div>
    </aside>
  );
}

const proxyComponentVariant = cva("gencl:border-b gencl:border-secondary-100 gencl:px-3 gencl:py-4", {
  variants: {
    variant: {
      default: "gencl:flex gencl:flex-col gencl:[&_p]:hidden gencl:[&_p]:xl:block",
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

  return (
    <div className={cn(proxyComponentVariant({ variant }))}>
      {!isAuthenticated && showLogin && (
        <SafeSuspense fallback={<ProxyItem icon={<LoginIcon size="lg" />} text="Log in" />} errorFallback={null}>
          <AuthenticationModal asChild={false} customStep="SIGNIN" className="gencl:w-full">
            <ProxyItem icon={<LoginIcon size="lg" />} text="Log in" />
          </AuthenticationModal>
        </SafeSuspense>
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
