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

type SideBarProps = ComponentProps<"aside">;

export function SideBar({ className, ...restProps }: SideBarProps) {
  const { brandDetails } = useBaseContext();
  const showBecomeACreator = brandDetails.show_become_creator ?? true;

  return (
    <aside
      className={cn(
        "gencl:border-r gencl:xl:!w-60 gencl:border-secondary-150 gencl:w-16 gencl:shrink-0 gencl:flex gencl:flex-col",
        className
      )}
      {...restProps}
    >
      <SidebarActions
        brandConfiguredTerms={brandDetails.terms_and_condition?.trim() || null}
        brandConfiguredPrivacy={brandDetails.privacy_policy?.trim() || null}
      />
      {showBecomeACreator && (
        <SideBarBecomeCreator className="gencl:hidden gencl:xl:!block" />
      )}
      <Category />
      <Recent />
      <PoweredByGenuin />
    </aside>
  );
}
