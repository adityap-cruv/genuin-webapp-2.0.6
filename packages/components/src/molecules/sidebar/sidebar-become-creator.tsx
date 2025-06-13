import { useEffect, type ComponentProps } from "react";
import { cn } from "@genuin/ui/utils";
import { useAuthenticationModalContext } from "@organisms/authentication-modal/context";
import { AuthenticationModal } from "@organisms/authentication-modal";

export type SideBarBecomeCreatorProps = ComponentProps<"div">;

export function SideBarBecomeCreator({
  className,
  ...restProps
}: SideBarBecomeCreatorProps) {

  return (
    <AuthenticationModal asChild customStep="BECOME_CREATOR">
      <div
        className={cn(
          "gencl:px-4 gencl:py-3 gencl:border-b gencl:border-secondary-100 gencl:cursor-pointer",
          className
        )}
        {...restProps}
      >
        <div className="gencl:bg-primary gencl:text-white gencl:break-words gencl:rounded-lg gencl:px-2.5 gencl:py-2 gencl:text-body-1-semi-bold">
          Become a Creator for Genuin, get rewards 🚀
        </div>
      </div>
    </AuthenticationModal>
  );
}
