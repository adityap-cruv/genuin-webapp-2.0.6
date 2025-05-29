import { cn } from "@genuin/ui/utils";
import { ComponentProps } from "react";
import { SidebarActions, SideBarBecomeCreator } from "src/molecules/sidebar";
import { Category } from "src/molecules/sidebar/category";
import { Recent } from "src/molecules/sidebar/recent";

type SideBarProps = ComponentProps<"aside">;

export function SideBar({ className, ...restProps }: SideBarProps) {
  return (
    <aside
      className={cn(
        "gencl:border-r gencl:w-60 gencl:h-full gencl:border-secondary-150",
        className
      )}
      {...restProps}
    >
      <SidebarActions />
      <SideBarBecomeCreator />
      <Category />
      <Recent />
    </aside>
  );
}
