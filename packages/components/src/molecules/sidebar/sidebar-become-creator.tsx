import type { ComponentProps } from "react";
import { cn } from "@genuin/ui/utils";

export type SideBarBecomeCreatorProps = ComponentProps<"div">;

export function SideBarBecomeCreator({ className, ...restProps }: SideBarBecomeCreatorProps) {
  return (
    <div
      className={cn("gencl:px-4 gencl:py-3 gencl:border-b-4 gencl:border-secondary-100", className)}
      {...restProps}
    >
      <div className="gencl:bg-primary gencl:text-white gencl:break-words gencl:rounded-lg gencl:px-2.5 gencl:py-2 gencl:text-body-1-semi-bold">
        Become a Creator for Genuin, get rewards 🚀
      </div>
    </div>
  );
}
