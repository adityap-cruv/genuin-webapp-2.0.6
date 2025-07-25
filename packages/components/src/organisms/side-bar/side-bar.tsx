"use client";

import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import {
  SidebarActions,
  SideBarBecomeCreator,
} from "@genuin/components/molecules/sidebar";
import { Category } from "@genuin/components/molecules/sidebar/category";
import { Recent } from "@genuin/components/molecules/sidebar/recent";
import { PoweredByGenuin } from "@genuin/components/molecules/sidebar";
import { useBaseContext } from "@genuin/components/context/base";
import { cva, VariantProps } from "class-variance-authority";

type SideBarProps = ComponentProps<"aside"> &
  VariantProps<typeof sidebarVariants> & {
    onItemClick?: () => void;
  };

const sidebarVariants = cva(
  "gencl:relative gencl:h-[calc(100%-48px)] gencl:flex gencl:flex-col gencl:overflow-y-auto",
  {
    variants: {
      variant: {
        default:
          "gencl:border-r gencl:xl:!w-60 gencl:border-secondary-150 gencl:w-16 gencl:shrink-0",
        mobile: "gencl:w-full gencl:xl:block!",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function SideBar({
  variant,
  className,
  onItemClick,
  ...restProps
}: SideBarProps) {
  const { brandDetails } = useBaseContext();
  const showBecomeACreator = brandDetails.show_become_creator ?? true;

  return (
    <aside
      className={cn(sidebarVariants({ variant }), className)}
      {...restProps}
    >
      <SidebarActions
        brandConfiguredTerms={brandDetails.terms_and_condition ?? ""}
        brandConfiguredPrivacy={brandDetails.privacy_policy ?? ""}
        variant={variant}
        onItemClick={onItemClick}
      />
      {showBecomeACreator && <SideBarBecomeCreator variant={variant} />}
      <Category variant={variant} onItemClick={onItemClick} />
      <Recent variant={variant} onItemClick={onItemClick} />
      <PoweredByGenuin variant={variant} />
    </aside>
  );
}
