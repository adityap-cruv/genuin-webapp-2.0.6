"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@genuin/ui/components/dialog";
import { ComponentProps, useState } from "react";
import { ModalShell } from "./modal-shell";
import { cn } from "@genuin/ui/lib/utils";
import {
  AuthActionType,
  AuthenticationModalProvider,
  useAuthenticationModalContext,
  getAppDataType,
} from "./context";
import { Screens } from "./screens";
import { useBaseContext } from "@genuin/components/context/base";

export type AuthenticationModalProps = ComponentProps<typeof DialogTrigger> & {
  action?: AuthActionType;
  open?: boolean;
  customStep?: ComponentProps<typeof AuthenticationModalProvider>["customStep"];
  onOpenChange?: (open: boolean) => void;
  getAppData?: Partial<getAppDataType>;
  showClose?: boolean;
};

export function AuthenticationModal({
  children,
  asChild,
  action,
  open: controlledOpen,
  customStep,
  onOpenChange,
  getAppData,
  showClose = true,
  ...restProps
}: AuthenticationModalProps) {
  const {
    brandDetails: { web_cta },
  } = useBaseContext();

  const [internalOpen, setInternalOpen] = useState(false);

  const step = customStep ?? (web_cta !== "app" ? "SIGNIN" : "GET_APP");

  const compactSteps = ["DELETE_CONFIRMATION", "SIGN_OUT", "REMOVE_PICTURE"]; // Steps that use reduced padding and width

  const expandedSteps = ["EDIT_PROFILE_PICTURE"]; // Steps that use expand width

  const variant = compactSteps.includes(step)
    ? "compact"
    : expandedSteps.includes(step)
      ? "expanded"
      : "default";

  const wrapClass = cn(
    "gencl:p-0 gencl:!max-w-xl gencl:rounded-t-2xl gencl:md:rounded-2xl!",
    compactSteps.includes(step)
      ? "gencl:max-w-[500px]"
      : expandedSteps.includes(step)
        ? "gencl:!max-w-4xl"
        : "gencl:!max-w-xl"
  );

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

  const handleOpen = () => {
    handleOpenChange(true);
  };

  return (
    <Dialog
      type={`${getAppData?.data?.type}-dialog`}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild {...restProps}>
        {children}
      </DialogTrigger>
      <DialogContent
        bgBlur={customStep === "GET_APP_WITH_BLURRED_BG"}
        className={wrapClass}
        showClose={showClose}
      >
        <AuthenticationModalProvider
          action={action}
          customStep={customStep}
          onClose={handleClose}
          onOpen={handleOpen}
          getAppData={getAppData}
        >
          <div className="gencl:max-h-[90vh] gencl:overflow-y-auto">
            <Content variant={variant} />
          </div>
        </AuthenticationModalProvider>
      </DialogContent>
    </Dialog>
  );
}

function Content({ variant }: { variant: "default" | "compact" | "expanded" }) {
  const { step } = useAuthenticationModalContext();
  // Determine if the back button should be shown based on the current step
  const showBackButton =
    step === "VERIFY_PHONE_OTP" ||
    step === "VERIFY_MAIL_OTP" ||
    step === "LOGIN_OTP_INPUT";

  return (
    <ModalShell showBack={showBackButton} variant={variant}>
      <Screens />
    </ModalShell>
  );
}
