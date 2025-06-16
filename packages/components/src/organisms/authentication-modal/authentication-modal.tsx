"use client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@genuin/ui/components/dialog";
import { ComponentProps, useState, useEffect } from "react";
import { ModalShell } from "./modal-shell";
import {
  AuthActionType,
  AuthenticationModalProvider,
  useAuthenticationModalContext,
  getAppDataType,
  setGlobalModalState,
  StepsType,
} from "./context";
import { Screens } from "./screens";
import { useBaseContext } from "@genuin/components/context/base";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";

type AuthenticationModalProps = ComponentProps<typeof DialogTrigger> & {
  action?: AuthActionType;
  open?: boolean;
  customStep?: ComponentProps<typeof AuthenticationModalProvider>["customStep"];
  onOpenChange?: (open: boolean) => void;
  getAppData?: getAppDataType;
};

export function AuthenticationModal({
  children,
  asChild,
  action,
  open: controlledOpen,
  customStep,
  onOpenChange,
  getAppData,
  ...restProps
}: AuthenticationModalProps) {
  const {
    brandDetails: { web_cta },
  } = useBaseContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const step = customStep ?? (web_cta !== "app" ? "SIGNIN" : "GET_APP");

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

  // Update global modal state when component mounts or handleOpenChange changes
  useEffect(() => {
    setGlobalModalState({
      isOpen,
      onOpenChange: (
        open: boolean,
        step?: StepsType,
        appData?: getAppDataType
      ) => {
        if (step) {
          // If a specific step is provided, update the customStep
          customStep = step;
        }
        if (appData) {
          // If app data is provided, update getAppData
          getAppData = appData;
        }
        handleOpenChange(open);
      },
    });
  }, [isOpen, handleOpenChange, customStep, getAppData]);

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
          onOpen={handleOpen}
          getAppData={getAppData}
        >
          <div className="gencl:max-h-[90vh] gencl:overflow-y-auto">
            <Content />
          </div>
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
