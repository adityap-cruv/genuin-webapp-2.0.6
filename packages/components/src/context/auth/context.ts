"use client";
import { createContext, useContext } from "react";
import type { AuthUser } from "@genuin/components/types/auth";
import { ActionType } from "@genuin/components/lib/utils/return-query";

export type AuthenticationStatusType =
  | "unauthenticated"
  | "authenticated"
  | "loading";

export type AuthCallbackDataType = {
  path: string;
  action: ActionType;
  returnQueryParams: string;
};

type AuthContextType = {
  user?: AuthUser | null;
  authenticationStatus: AuthenticationStatusType;
  signIn: (user: AuthUser) => void;
  signOut: (redirectPath: string) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  /**
   * Handles authentication callback logic based on environment
   * @param authCallbackData - Data to pass to external auth handler
   * @param urlToOpen - URL to open for external authentication
   * @returns Function to handle external auth if available, otherwise undefined
   */
  handleAuthCallback: (props: {
    authCallbackData: AuthCallbackDataType;
    urlToOpen?: string;
  }) => (() => void) | undefined;
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
