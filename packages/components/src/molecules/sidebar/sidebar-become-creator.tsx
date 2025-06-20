import { useEffect, type ComponentProps } from "react";
import { cn } from "@genuin/ui/utils";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useAuthContext } from "@genuin/components/context/auth";

export type SideBarBecomeCreatorProps = ComponentProps<"div">;

export function SideBarBecomeCreator({
  className,
  ...restProps
}: SideBarBecomeCreatorProps) {
  const {authenticationStatus} = useAuthContext()
  return (
    <AuthenticationModal asChild customStep={authenticationStatus === "authenticated" ?  "BECOME_CREATOR" : "SIGNIN"}>
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
