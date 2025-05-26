import { getRandomAvatar } from "@genuin/ui/utils";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useCallback } from "react";

import { type AuthActionType } from "./api/auth";

export type FlowType = "email" | "phone";

export type StepsType =
  | "STARTER"
  | "LOGIN_OTP_INPUT"
  | "EDIT_BIRTHDATE"
  | "EDIT_PHONE_NUMBER"
  | "EDIT_EMAIL_SUCCESS"
  | "EDIT_PHONE_NUMBER_SUCCESS"
  | "EDIT_USERNAME"
  | "EDIT_EMAIL"
  | "VERIFY_MAIL_OTP"
  | "VERIFY_PHONE_OTP"
  | "CATEGORY_SELECTION"
  | "CLAIM_BRAND_PROFILE"
  | "IMAGE_CROPPER"
  | "COMPLETE_PROFILE"
  | "USERNAME_INPUT"
  | "GUIDELINES"
  | "KS_CB_WEB"
  | "KS_CB_SUBDOMAIN"
  | "LOGOUT"
  | "DELETE_CONFIRMATION"
  | "DELETE_CONFIRMED"
  | "WALLET_HOW_IT_WORKS"
  | "WITHDRAW_CASH"
  | "REDEEM_CREDITS";

type FormDataType = {
  displayName: string;
  email: string;
  password: string;
  phoneNumber: string;
  image: string | File;
  isAvatar: boolean;
  bio: string;
  username: string;
  otp: number;
  userId: string;
  imageName: string;
  retryTime: number;
  flowType: FlowType;
  birth?: string;
};

type States = {
  step: StepsType;
  previousStep?: StepsType;
  formData: Partial<FormDataType>;
  isOpen: boolean;
  note?: React.ReactNode;
  action?: AuthActionType;
  onCloseCallback?: () => void;
};

type Actions = {
  open: (onCloseCallback?: () => void) => void;
  openWithStep: (
    action?: AuthActionType,
    step?: StepsType,
    onCloseCallback?: () => void
  ) => void;
  goToPrevious: () => void;
  close: () => void;
  setStep: (step: StepsType, action?: AuthActionType) => void;
  reset: () => void;
  setFormData: (formData: Partial<FormDataType>) => void;
};

type AuthenticationContextType = States & Actions;

const initialStates: States = {
  step: "STARTER",
  formData: {
    image: getRandomAvatar(),
    isAvatar: true,
    flowType: "email",
  },
  isOpen: false,
};

const AuthenticationContext = createContext<
  AuthenticationContextType | undefined
>(undefined);

export function AuthenticationModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<States>(initialStates);

  const open = useCallback((onCloseCallback?: () => void) => {
    setState((prevState) => ({ ...prevState, isOpen: true, onCloseCallback }));
  }, []);

  const openWithStep = useCallback(
    (
      action?: AuthActionType,
      step: StepsType = "STARTER",
      onCloseCallback?: () => void
    ) => {
      setState((prevState) => ({
        ...prevState,
        isOpen: true,
        step,
        action,
        onCloseCallback,
      }));
    },
    []
  );

  const close = useCallback(() => {
    setState((prevState) => {
      const { onCloseCallback } = prevState;
      if (onCloseCallback) {
        onCloseCallback();
      }
      return { ...prevState, isOpen: false };
    });
  }, []);

  const setStep = useCallback((step: StepsType, action?: AuthActionType) => {
    setState((prevState) => ({
      ...prevState,
      previousStep: prevState.step,
      step,
      action: action !== undefined ? action : prevState.action,
    }));
  }, []);

  const goToPrevious = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      step: prevState.previousStep ?? "STARTER",
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialStates);
  }, []);

  const setFormData = useCallback((formData: Partial<FormDataType>) => {
    setState((prevState) => ({
      ...prevState,
      formData: { ...prevState.formData, ...formData },
    }));
  }, []);

  const contextValue: AuthenticationContextType = {
    ...state,
    open,
    openWithStep,
    close,
    setStep,
    goToPrevious,
    reset,
    setFormData,
  };

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthenticationModal() {
  const context = useContext(AuthenticationContext);
  if (context === undefined) {
    throw new Error(
      "useAuthenticationModal must be used within an AuthenticationProvider"
    );
  }
  return context;
}
