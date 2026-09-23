"use client";
import { AuthProvider } from "@genuin/components/context/auth";
import { parseKsCbRequestStatus } from "@genuin/components/types/roles";
import { signIn, useSession, signOut } from "next-auth/react";
import React, { useEffect } from "react";

import { useGenuinOptions } from "@lib/stores/genuin-options";
import { mapToAuthUser } from "@lib/utils/map-to-auth-user";

type SiteLayoutProps = {
  children: React.ReactNode;
};

export function AuthBridge({ children }: SiteLayoutProps) {
  const { data: authUser, update } = useSession();

  const mappedUser = authUser?.user
    ? { ...authUser.user, ksCbRequestStatus: parseKsCbRequestStatus(authUser.user.ksCbRequestStatus) }
    : null;

  // Hand the authenticated session to any embedded WebSDK so it renders
  // authenticated without a separate login/auth API call. Safe if the SDK is not
  // yet loaded: window.genuin queues the call until init completes.
  const sessionUser = authUser?.user;
  useEffect(() => {
    if (sessionUser?.accessToken) {
      window.genuin?.setUser?.({
        user: mapToAuthUser(sessionUser),
        accessToken: sessionUser.accessToken,
        refreshToken: sessionUser.refreshToken,
      });
    }
  }, [sessionUser]);

  return (
    <AuthProvider
      user={mappedUser}
      onSignIn={async (user) => {
        await signIn("credentials", { ...user, profileImage: user.image, redirect: false }).then((_result) => {});
      }}
      onSignOut={(redirectPath) => {
        // Clear user data from Zustand store
        useGenuinOptions.getState().clearUserData();
        // Propagate logout to any embedded WebSDK so its embeds clear their user too.
        window.genuin?.logout?.();
        return signOut({ callbackUrl: redirectPath });
      }}
      onUpdateUser={async (newUser) => {
        await update({ ...authUser, user: { ...authUser?.user, ...newUser } });
      }}>
      {children}
    </AuthProvider>
  );
}
