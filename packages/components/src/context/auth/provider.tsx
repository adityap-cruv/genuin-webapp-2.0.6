"use client";
import {
  axiosInstance,
  clearAuthTokenInterceptor,
  removeAllAuthToken,
  setAuthTokenInAxiosInstance,
} from "@genuin/components/react-query/axios-instance";
import type { AuthUser } from "../../types/auth";

import {
  AuthCallbackDataType,
  AuthContext,
  AuthenticationStatusType,
} from "./context";
import { useCallback, useLayoutEffect, useEffect, useState } from "react";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { useGetUserDataForSSOMutation } from "@genuin/components/react-query/api/authentication/auto-login";
import { Toast } from "@genuin/ui/components/toaster";
import { invalidateAllQueries } from "@genuin/components/react-query/client";
import { useBaseContext } from "../base";
import {
  SDKEventEmitter,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { useSafeEmbedContext } from "../embed/context";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  emitCachedUserUpdateEvent,
  emitRefreshFailedEvent,
  performTokenRefresh,
} from "./token-refresh";
import {
  savePendingAction,
  type PendingActionData,
} from "@genuin/components/lib/utils/pending-action-storage";
import { AnalyticsService } from "../analytics/service";

// Define global window type for genuinAuth
declare global {
  interface Window {
    genuinAuth?: (authCallbackData: AuthCallbackDataType) => void;
  }
}

// Extend the axios config type to include our custom retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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

  // Access isEmbed from BaseContext
  const { isEmbed, isInIframe } = useBaseContext?.() || { isEmbed: false };

  // Access embedData.style from EmbedContext if available
  const embedData = useSafeEmbedContext?.()?.embedData;

  const { mutate: getUserDataForSSO } = useGetUserDataForSSOMutation({
    onSuccess: async ({ user }) => {
      if (!user) throw new Error("User data not found in SSO response");

      await signIn(user);
      // Remove the 'code' and 'provider' search params after successful login
      removeSearchParams(["code", "provider"]);
    },
    onError: (e) => {
      Toast.Error({ message: "Not able to login. Please try again." });
    },
  });

  const [authenticationStatus, setAuthenticationStatus] =
    useState<AuthenticationStatusType>(
      !!user ? "authenticated" : "unauthenticated"
    );

  useLayoutEffect(() => {
    const handleAuthenticateUser = (authCallbackData: any) => {
      setAuthenticatedUser(authCallbackData.payload);
      setAuthenticationStatus("authenticated");
      const newUser = authCallbackData.payload;
      AnalyticsService.updatePayload({
        gen_user_id: newUser.id,
        user_id: newUser.id,
        phone_no: newUser.phoneNumber,
        user_name: newUser.nickname,
        gen_user_name: newUser.nickname,
      });
    };

    const handleLogoutUser = async () => {
      try {
        if (isEmbed) {
          // In embed mode, just clear auth without redirect
          setAuthenticatedUser(null);
          setAuthenticationStatus("unauthenticated");
          removeAllAuthToken();
        } else {
          // In non-embed mode, perform full sign-out with redirect
          await signOut("/home");
        }
      } catch (error) {
        console.error("AuthProvider: Error handling logout event:", error);
      }
    };

    SDKEventEmitter.on(
      SDKListenerEventName.AUTHENTICATE_USER,
      handleAuthenticateUser
    );

    SDKEventEmitter.on(SDKListenerEventName.LOGOUT_USER, handleLogoutUser);

    return () => {
      SDKEventEmitter.off(
        SDKListenerEventName.AUTHENTICATE_USER,
        handleAuthenticateUser
      );
      SDKEventEmitter.off(SDKListenerEventName.LOGOUT_USER, handleLogoutUser);
    };
  }, []);

  // Synchronously manage the authentication token in Axios instance when the external 'user' prop changes.
  // This ensures the token is set/removed before any subsequent network requests.
  useLayoutEffect(() => {
    // Use authenticatedUser first as it reflects the most current state (including refreshed tokens)
    // If authenticatedUser is explicitly null (after logout), don't fall back to user prop
    const token =
      authenticatedUser === null
        ? null
        : (authenticatedUser?.accessToken ?? user?.accessToken);
    if (!!token) {
      setAuthTokenInAxiosInstance(token);
      invalidateAllQueries();
    } else {
      clearAuthTokenInterceptor();
      invalidateAllQueries();
    }
  }, [authenticatedUser, user]);

  useEffect(() => {
    const code = getSearchParams("code") as string;
    const provider = getSearchParams("provider") as string;
    if (!code || !provider || !!authenticatedUser) {
      return;
    }

    getUserDataForSSO({ code, provider, isInIframe });
  }, [searchParams, removeSearchParams, getSearchParams, authenticatedUser]);

  const signIn = useCallback(
    async (newUser: AuthUser) => {
      try {
        setAuthenticatedUser(newUser);
        setAuthenticationStatus("loading");
        if (!!newUser) {
          await onSignIn?.(newUser);
        }
        AnalyticsService.updatePayload({
          gen_user_id: newUser.id,
          user_id: newUser.id,
          phone_no: newUser.phoneNumber,
          user_name: newUser.nickname,
          gen_user_name: newUser.nickname,
        });
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
          AnalyticsService.updatePayload({
            gen_user_id: mergedUser.id,
            user_id: mergedUser.id,
            phone_no: mergedUser.phoneNumber,
            user_name: mergedUser.nickname,
            gen_user_name: mergedUser.nickname,
          });
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

  /**
   * Handles authentication callback behavior based on environment (embed vs non-embed)
   * and availability of global auth handler
   *
   * @param authCallbackData - Data to be passed to the authentication callback
   * @param urlToOpen - URL to open if external authentication is needed
   * @param pendingActionData - Optional pending action data to save before authentication
   * @returns Function to handle external auth if applicable, otherwise undefined
   */
  const handleAuthCallback = useCallback(
    ({
      authCallbackData,
      urlToOpen,
      pendingActionData,
    }: {
      authCallbackData: AuthCallbackDataType;
      urlToOpen?: string;
      pendingActionData?: Omit<PendingActionData, "timestamp">;
    }) => {
      // For non-embed environments and authenticated user, always return undefined so consumer shows auth modal
      if (!isEmbed || authenticationStatus === "authenticated") {
        return undefined;
      }

      // In embed environments with genuinAuth.
      // return a function to handle external auth
      if (window.genuinAuth) {
        return () => {
          // Save pending action if provided and user is unauthenticated
          if (authenticationStatus === "unauthenticated" && pendingActionData) {
            savePendingAction(pendingActionData);
          }

          if (window.genuinAuth) {
            window.genuinAuth(authCallbackData);
          }
        };
      }

      // For standard_wall embeds without genuinAuth, return undefined
      // so consumer shows auth modal
      return undefined;
    },
    [isEmbed, embedData?.style, authenticationStatus]
  );

  useEffect(() => {
    // Response interceptor to handle token refresh
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // If the error is 401 and we haven't already tried to refresh
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const newTokens = await performTokenRefresh(
              user?.accessToken,
              user?.refreshToken
            );

            if (newTokens) {
              const updatedUser = { ...user, ...newTokens };

              if (isEmbed) emitCachedUserUpdateEvent(updatedUser);

              await updateUser(updatedUser);
              setAuthTokenInAxiosInstance(newTokens.accessToken);
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            if (isEmbed) {
              removeAllAuthToken();
              emitRefreshFailedEvent({
                token:
                  authenticatedUser?.autoLoginToken || user?.autoLoginToken,
                brandId: authenticatedUser?.brandId ?? user?.brandId ?? 0,
                params: {},
              });
            } else {
              signOut("/home");
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authenticatedUser,
        authenticationStatus,
        signIn,
        signOut,
        updateUser,
        handleAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
