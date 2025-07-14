import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { Button } from "@genuin/ui/button";
import type { ComponentPropsWithoutRef } from "react";

type BecomeCreatorButtonPropsType = Omit<
  ComponentPropsWithoutRef<typeof Button> & {
    buttonText?: string;
  },
  "children"
>;

export function BecomeCreatorButton({
  buttonText,
  size,
  ...restProps
}: BecomeCreatorButtonPropsType) {
  const { authenticationStatus } = useAuthContext();
  const { web_cta } = useBaseContext().brandDetails;

  return (
    <AuthenticationModal
      asChild
      customStep={
        authenticationStatus === "unauthenticated"
          ? web_cta === "app"
            ? "GET_APP"
            : "SIGNIN"
          : "BECOME_CREATOR"
      }
    >
      <Button size={size ?? "md"} {...restProps}>
        {buttonText ?? "Become a Creator"}
      </Button>
    </AuthenticationModal>
  );
}
