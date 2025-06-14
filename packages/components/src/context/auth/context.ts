"use client";
import { createContext, useContext } from "react";
import type { AuthUser } from "@genuin/components/types/auth";

export type AuthenticationStatusType =
  | "unauthenticated"
  | "authenticated"
  | "loading";

type AuthContextType = {
  user?: AuthUser | null;
  authenticationStatus: AuthenticationStatusType;
  signIn: (user: AuthUser) => void;
  signOut: (redirectPath: string) => void;
  updateUser: (user: Partial<AuthUser>) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * Hook to access the auth context.
 * @returns AuthContextType
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
