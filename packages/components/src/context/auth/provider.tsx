"use client";
import {
  clearAuthTokenInterceptor,
  removeAllAuthToken,
  setAuthTokenInAxiosInstance,
} from "@genuin/components/react-query/axios-instance";
import type { AuthUser } from "../../types/auth";

import { AuthContext, AuthenticationStatusType } from "./context";
import { useCallback, useLayoutEffect, useEffect, useState } from "react";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { useGetUserDataForSSOMutation } from "@genuin/components/react-query/api/authentication/auto-login";
import { Toast } from "@genuin/ui/components/toaster";
import { invalidateAllQueries } from "@genuin/components/react-query/client";

// Define the props type for the AuthProvider component.
type AuthProviderPropsType = {
  children: React.ReactNode;
  user?: AuthUser | null;
  /**
   * Callback function to be called when the user signs in.
   * @param user - The authenticated user object.
   */
  onSignIn: (user: AuthUser) => Promise<void> | void;
  /**
   * Callback function to be called when the user signs out.
   * @param redirectPath - The path to redirect the user to after signing out.
   */
  onSignOut: (redirectPath: string) => Promise<void> | void;
  /**
   * Callback function to be called when the user updates their profile.
   * @param newUser - The updated user object.
   */
  onUpdateUser: (newUser: Partial<AuthUser>) => Promise<void> | void;
};

/**
 * AuthProvider manages authentication state and provides it to child components via context.
 * It handles sign-in, sign-out, user updates, and token management.
 */
export function AuthProvider({
  children,
  user,
  onSignIn,
  onSignOut,
  onUpdateUser,
}: AuthProviderPropsType) {
  const [authenticatedUser, setAuthenticatedUser] = useState<
    AuthUser | null | undefined
  >(user);
  const { removeSearchParams, getSearchParams, searchParams } =
    useSearchParams();

  const { mutate: getUserDataForSSO } = useGetUserDataForSSOMutation({
    onSuccess: async ({ user }) => {
      if (!user) throw new Error("User data not found in SSO response");

      await signIn(user);
      // Remove the 'code' and 'provider' search params after successful login
      removeSearchParams(["code", "provider"]);
    },
    onError: (e) => {
      Toast.Error({message : "Not able to login. Please try again."})
    },
  });

  const [authenticationStatus, setAuthenticationStatus] =
    useState<AuthenticationStatusType>(
      !!user ? "authenticated" : "unauthenticated"
    );

  // Synchronously manage the authentication token in Axios instance when the external 'user' prop changes.
  // This ensures the token is set/removed before any subsequent network requests.
  useLayoutEffect(() => {
    const token = user?.accessToken ?? authenticatedUser?.accessToken;
    if (!!token) {
      setAuthTokenInAxiosInstance(token);
      invalidateAllQueries();
    } else {
      clearAuthTokenInterceptor();
      invalidateAllQueries();
    }
  }, [user, authenticatedUser]);

  useEffect(() => {
    const code = getSearchParams("code") as string;
    const provider = getSearchParams("provider") as string;
    if (!code || !provider || !!authenticatedUser) {
      return;
    }

    getUserDataForSSO({ code, provider });
  }, [searchParams, removeSearchParams, getSearchParams, authenticatedUser]);

  const signIn = useCallback(
    async (newUser: AuthUser) => {
      try {
        setAuthenticatedUser(newUser);
        setAuthenticationStatus("loading");
        if (!!newUser) {
          await onSignIn?.(newUser);
        }
        setAuthenticationStatus("authenticated");
      } catch (error) {
        setAuthenticationStatus("unauthenticated");
        setAuthenticatedUser(null);
      }
    },
    [onSignIn]
  );

  const signOut = useCallback(
    async (redirectPath: string) => {
      try {
        setAuthenticationStatus("loading");
        await onSignOut?.(redirectPath);
        setAuthenticatedUser(null);
        setAuthenticationStatus("unauthenticated");
        removeAllAuthToken(); // Ensure token is removed on sign out.
      } catch (error) {
        setAuthenticationStatus("unauthenticated");
        console.error("Error during sign out:", error);
      }
    },
    [onSignOut]
  );

  const updateUser = useCallback(
    async (newUser: Partial<AuthUser>) => {
      try {
        setAuthenticationStatus("loading");
        if (!!newUser) {
          // Merge updated fields into the current authenticatedUser
          const mergedUser = {
            ...authenticatedUser,
            ...newUser,
          } as AuthUser;
          await onUpdateUser?.(mergedUser);
          setAuthenticatedUser(mergedUser);
        }
        setAuthenticationStatus("authenticated");
      } catch (error) {
        console.error("Error during user update:", error);
        setAuthenticationStatus(
          authenticatedUser ? "authenticated" : "unauthenticated"
        );
      }
    },
    [onUpdateUser, authenticatedUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user: authenticatedUser,
        authenticationStatus,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
