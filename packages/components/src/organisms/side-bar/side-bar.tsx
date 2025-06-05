import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { SidebarActions, SideBarBecomeCreator } from "src/molecules/sidebar";
import { Category } from "src/molecules/sidebar/category";
import { Recent } from "src/molecules/sidebar/recent";

type SideBarProps = ComponentProps<"aside">;

export function SideBar({ className, ...restProps }: SideBarProps) {
  return (
    <aside
      className={cn(
        "gencl:border-r gencl:h-full gencl:border-secondary-150 gencl:w-16 gencl:shrink-0 gencl:xl:w-60",
        className
      )}
      {...restProps}
    >
      <SidebarActions />
      <SideBarBecomeCreator className="gencl:hidden gencl:xl:block" />
      <Category />
      <Recent />
    </aside>
  );
}
