import { ComponentProps } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthenticationModalContext } from "../../context";
import { Button } from "@genuin/ui/components";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@genuin/components/context/auth";

export function SignOut({ className, ...restProps }: ComponentProps<"div">) {
  const { closeModal } = useAuthenticationModalContext();
  const { signOut } = useAuthContext();

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-left gencl:text-headline-4-semi-bold gencl:mb-5">
          Logging out?
        </h3>
        <p className="gencl:text-left gencl:text-body-1-medium">
          Are you sure you want to log out from your account?
        </p>
      </div>
      <div className="gencl:flex gencl:gap-5 gencl:justify-end">
        <Button
          theme="text"
          onClick={closeModal}
          className="gencl:text-body-0-semi-bold"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          // className="gencl:w-full gencl:mb-2"
          onClick={() => {
            signOut(buildPageUrl({ type: "home" }));
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
