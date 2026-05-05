"use client";
import { AuthProvider } from "@genuin/components/context/auth";
import type { ksCbRequestStatusType } from "@genuin/components/types/roles";
import { signIn, useSession, signOut } from "next-auth/react";
import React from "react";

import { useGenuinOptions } from "@lib/stores/genuin-options";

type SiteLayoutProps = {
  children: React.ReactNode;
};

function mapKsCbStatus(status: number | string): ksCbRequestStatusType {
  if (status === 1 || status === "Pending") return "Pending";
  if (status === 2 || status === "Requested") return "Requested";
  // in ksCbRequestStatusType, there is no "Pending" status, so we are mapping it to "Requested" status.
  if (status === "Success") return "Success";
  return "Accepted";
}

export function AuthBridge({ children }: SiteLayoutProps) {
  const { data: authUser, update } = useSession();

  const mappedUser = authUser?.user
    ? { ...authUser.user, ksCbRequestStatus: mapKsCbStatus(authUser.user.ksCbRequestStatus) }
    : null;
  return (
    <AuthProvider
      user={mappedUser}
      onSignIn={async (user) => {
        await signIn("credentials", { ...user, profileImage: user.image, redirect: false }).then((_result) => {});
      }}
      onSignOut={(redirectPath) => {
        // Clear user data from Zustand store
        useGenuinOptions.getState().clearUserData();
        return signOut({ callbackUrl: redirectPath });
      }}
      onUpdateUser={async (newUser) => {
        await update({ ...authUser, user: { ...authUser?.user, ...newUser } });
      }}>
      {children}
    </AuthProvider>
  );
}
