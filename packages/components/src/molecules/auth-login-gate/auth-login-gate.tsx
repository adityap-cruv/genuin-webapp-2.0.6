"use client";
import { lazy, type ReactNode } from "react";

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";

const AuthenticationModal = lazy(() =>
  import("@genuin/components/organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);

type StandardWallLoginGateProps = {
  /** From `useAuthRedirectHandler`; when set, redirect instead of opening the modal. */
  loginClickHandler: (() => void) | undefined;
  /** The login trigger UI (Button, sidebar item, …). */
  children: ReactNode;
  asChild?: boolean;
  /** className for the auth modal trigger. */
  modalClassName?: string;
  /** className for the redirect click wrapper. */
  wrapperClassName?: string;
};

/** "Log in" gate: standard-wall redirects externally, otherwise opens the SIGNIN modal. */
export function StandardWallLoginGate({
  loginClickHandler,
  children,
  asChild = true,
  modalClassName,
  wrapperClassName,
}: StandardWallLoginGateProps) {
  if (loginClickHandler) {
    return (
      <div className={wrapperClassName} onClick={loginClickHandler}>
        {children}
      </div>
    );
  }

  return (
    <SafeSuspense fallback={children} errorFallback={null}>
      <AuthenticationModal customStep="SIGNIN" asChild={asChild} className={modalClassName}>
        {children}
      </AuthenticationModal>
    </SafeSuspense>
  );
}
