import { Dialog, DialogContent } from "@genuin/ui/components/dialog";
import { cn } from "@genuin/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, lazy } from "react";

import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { Success } from "@genuin/components/molecules/success";
import type { AuthUser } from "@genuin/components/types/auth";

const AuthenticationModal = lazy(() =>
  import("@genuin/components/organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);

const sideBarBecomeCreatorVariants = cva(
  "gencl:px-4 gencl:py-3 gencl:border-b gencl:border-secondary-100 gencl:cursor-pointer",
  {
    variants: {
      variant: {
        default: "gencl:hidden gencl:xl:block!",
        mobile: "gencl:block",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type SideBarBecomeCreatorProps = ComponentProps<"div"> & VariantProps<typeof sideBarBecomeCreatorVariants>;

type CreatorSuccessProps = {
  user: AuthUser | null;
  onUserUpdate: (updates: Partial<AuthUser>) => void;
};

export function SideBarBecomeCreator({ className, variant, ...restProps }: SideBarBecomeCreatorProps) {
  const { user, updateUser } = useAuthContext();
  const {
    brandDetails: { name },
  } = useBaseContext();

  if (user?.ksCbRequestStatus === "Success") {
    return null;
  }
  if (user?.ksCbRequestStatus === "Accepted") return <BecomeCreatorSuccess user={user} onUserUpdate={updateUser} />;

  return (
    <>
      <SafeSuspense
        fallback={
          <div
            className={cn(
              "gencl:px-4 gencl:block gencl:sm:hidden! gencl:xl:block! gencl:py-3 gencl:border-b gencl:border-secondary-100 gencl:cursor-pointer",
              className
            )}
            {...restProps}>
            <div
              className={cn(
                "gencl:bg-primary gencl:text-white gencl:break-words gencl:rounded-lg gencl:px-2.5 gencl:py-2 gencl:text-body-1-semi-bold gencl:relative gencl:overflow-hidden",
                "genuin-become-creator-centerout"
              )}>
              <span className="gencl:relative gencl:z-10 gencl:text-white">
                Become a Creator for {name}, get rewards 🚀
              </span>
            </div>
          </div>
        }>
        <AuthenticationModal asChild customStep="BECOME_CREATOR">
          <div
            className={cn(
              "gencl:px-4 gencl:block gencl:sm:hidden! gencl:xl:block! gencl:py-3 gencl:border-b gencl:border-secondary-100 gencl:cursor-pointer",
              className
            )}
            {...restProps}>
            <div
              className={cn(
                "gencl:bg-primary gencl:text-white gencl:break-words gencl:rounded-lg gencl:px-2.5 gencl:py-2 gencl:text-body-1-semi-bold gencl:relative gencl:overflow-hidden",
                "genuin-become-creator-centerout"
              )}>
              <span className="gencl:relative gencl:z-10 gencl:text-white">
                Become a Creator for {name}, get rewards 🚀
              </span>
            </div>
          </div>
        </AuthenticationModal>
      </SafeSuspense>
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

function BecomeCreatorSuccess({ user, onUserUpdate }: CreatorSuccessProps) {
  const isDialogOpen = user?.ksCbRequestStatus === "Accepted";

  const handleDialogClose = () => {
    if (user) {
      onUserUpdate({ ksCbRequestStatus: "Success" });
    }
  };

  return (
    <Dialog type="become-creator-success" open={isDialogOpen} onOpenChange={handleDialogClose} modal>
      <DialogContent>
        <Success text="You're a Creator Now!" onClose={handleDialogClose} />
      </DialogContent>
    </Dialog>
  );
}
