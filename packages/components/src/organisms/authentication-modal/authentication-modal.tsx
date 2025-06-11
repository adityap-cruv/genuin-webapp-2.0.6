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

type AuthenticationModalProps = ComponentProps<typeof DialogTrigger> & {
  action?: AuthActionType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AuthenticationModal({
  children,
  asChild,
  action,
  open: controlledOpen,
  onOpenChange,
  ...restProps
}: AuthenticationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

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
      <DialogTrigger {...restProps}>{children}</DialogTrigger>
      <DialogContent className="gencl:p-0">
        <AuthenticationModalProvider
          action={action}
          customStep="SIGNIN"
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
