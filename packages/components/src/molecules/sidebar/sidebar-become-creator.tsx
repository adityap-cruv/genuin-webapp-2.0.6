import { type ComponentProps } from "react";
import { cn } from "@genuin/ui/utils";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";

export type SideBarBecomeCreatorProps = ComponentProps<"div">;

export function SideBarBecomeCreator({
  className,
  ...restProps
}: SideBarBecomeCreatorProps) {
  const { authenticationStatus, user } = useAuthContext();
  const { name , web_cta } = useBaseContext().brandDetails;
  if (user?.ksCbRequestStatus === "Accepted") return null;

  return (
    <>
      <AuthenticationModal
        asChild
        customStep={
          authenticationStatus === "authenticated" ? "BECOME_CREATOR" : (web_cta === "app" ? "GET_APP"  : "SIGNIN")
        }
      >
        <div
          className={cn(
            "gencl:px-4 gencl:py-3 gencl:border-b gencl:border-secondary-100 gencl:cursor-pointer",
            className
          )}
          {...restProps}
        >
          <div
            className={cn(
              "gencl:bg-primary gencl:text-white gencl:break-words gencl:rounded-lg gencl:px-2.5 gencl:py-2 gencl:text-body-1-semi-bold gencl:relative gencl:overflow-hidden",
              "genuin-become-creator-centerout"
            )}
          >
            <span className="gencl:relative gencl:z-10 gencl:text-white">
              Become a Creator for {name}, get rewards 🚀
            </span>
          </div>
        </div>
      </AuthenticationModal>
      <style>
        {`
          .genuin-become-creator-centerout {
            position: relative;
            overflow: hidden;
          }
          .genuin-become-creator-centerout::before {
            content: "";
            position: absolute;
            inset: 0;
            /* Horizontal gradient with subtle blurry edges */
            background: var(--gencl-color-primary-600);
            filter: blur(3px);
            border-radius: inherit;
            z-index: 0;
            transform: scaleX(0);
            transform-origin: center;
            opacity: 1;
            transition: transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.2s linear;
            pointer-events: none;
          }
          .genuin-become-creator-centerout:hover::before,
          .genuin-become-creator-centerout:focus-visible::before {
            transform: scaleX(1);
            opacity: 1;
          }
          .genuin-become-creator-centerout > * {
            position: relative;
            z-index: 1;
          }
        `}
      </style>
    </>
  );
}
