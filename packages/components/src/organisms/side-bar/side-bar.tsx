import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import {
  SidebarActions,
  SideBarBecomeCreator,
} from "@genuin/components/molecules/sidebar";
import { Category } from "@genuin/components/molecules/sidebar/category";
import { Recent } from "@genuin/components/molecules/sidebar/recent";

type SideBarProps = ComponentProps<"aside">;

export function SideBar({ className, ...restProps }: SideBarProps) {
  return (
    <aside
      className={cn(
        "gencl:border-r gencl:xl:!w-60 gencl:border-secondary-150 gencl:w-16 gencl:shrink-0 ",
        className
      )}
      {...restProps}
    >
      <SidebarActions />
      <SideBarBecomeCreator className="gencl:hidden gencl:xl:!block" />
      <Category />
      <Recent />
    </aside>
  );
}
