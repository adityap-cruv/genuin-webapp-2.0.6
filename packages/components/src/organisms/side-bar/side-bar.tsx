import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { SidebarActions, SideBarBecomeCreator } from "@molecules/sidebar";
import { Category } from "@molecules/sidebar/category";
import { Recent } from "@molecules/sidebar/recent";

type SideBarProps = ComponentProps<"aside">;

export function SideBar({ className, ...restProps }: SideBarProps) {
  return (
    <aside
      className={cn(
        "gencl:border-r gencl:h-full gencl:xl:!w-60 gencl:border-secondary-150 gencl:w-16 gencl:shrink-0 ",
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
