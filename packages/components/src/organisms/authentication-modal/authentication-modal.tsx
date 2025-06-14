"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@genuin/ui/components/dialog";
import { ComponentProps, useState } from "react";
import { ModalShell } from "./modal-shell";
import {
  AuthActionType,
  AuthenticationModalProvider,
  useAuthenticationModalContext,
} from "./context";
import { Screens } from "./screens";
import { useBaseContext } from "@genuin/components/context/base";

type AuthenticationModalProps = ComponentProps<typeof DialogTrigger> & {
  action?: AuthActionType;
  open?: boolean;
  customStep?: ComponentProps<typeof AuthenticationModalProvider>["customStep"];
  onOpenChange?: (open: boolean) => void;
};

export function AuthenticationModal({
  children,
  asChild,
  action,
  open: controlledOpen,
  customStep,
  onOpenChange,
  ...restProps
}: AuthenticationModalProps) {
  const {
    brandDetails: { web_cta },
  } = useBaseContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const step = customStep ?? (web_cta === "login" ? "SIGNIN" : "GET_APP");

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const handleOpenChange = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild {...restProps}>
        {children}
      </DialogTrigger>
      <DialogContent className="gencl:p-0 gencl:max-w-md">
        <AuthenticationModalProvider
          action={action}
          customStep={step}
          onClose={handleClose}
        >
          <Content />
        </AuthenticationModalProvider>
      </DialogContent>
    </Dialog>
  );
}

function Content() {
  const { step } = useAuthenticationModalContext();

  // Determine if the back button should be shown based on the current step
  const showBackButton =
    step === "VERIFY_PHONE_OTP" ||
    step === "VERIFY_MAIL_OTP" ||
    step === "LOGIN_OTP_INPUT";

  return (
    <ModalShell showBack={showBackButton}>
      <Screens />
    </ModalShell>
  );
}
