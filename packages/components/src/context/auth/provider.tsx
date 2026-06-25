"use client";
import { Toast } from "@genuin/ui/components/toaster";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useCallback, useLayoutEffect, useEffect, useState } from "react";

import { axiosRegistry, useAxiosInstance } from "@genuin/components/context/axios";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { SDKEventEmitter, SDKListenerEventName } from "@genuin/components/lib/sdk-event-emitter";
import { savePendingAction, type PendingActionData } from "@genuin/components/lib/utils/pending-action-storage";
import { triggerStandardWallRedirect } from "@genuin/components/lib/utils/standard-wall-auth-redirect";
import { useGetUserDataForSSOMutation } from "@genuin/components/react-query/api/authentication/auto-login";
import { invalidateAllQueries } from "@genuin/components/react-query/client";

import type { AuthUser } from "../../types/auth";
import { AnalyticsService } from "../analytics/service";
import { useBaseContext } from "../base";
import { useSafeEmbedContext } from "../embed/context";

import { AuthContext } from "./context";
import type { AuthCallbackDataType, AuthenticationStatusType } from "./context";
import { emitCachedUserUpdateEvent, emitRefreshFailedEvent, performTokenRefresh } from "./token-refresh";

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

function updateLocalStorageUserData(updates: Partial<AuthUser>) {
  const existingData = localStorage.getItem("genuin-user-data");
  if (existingData) {
    try {
      const parsedData = JSON.parse(existingData);
      const newData = {
        ...parsedData,
        ...updates,
      };
      localStorage.setItem("genuin-user-data", JSON.stringify(newData));
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }
}

/**
 * AuthProvider manages authentication state and provides it to child components via context.
 * It handles sign-in, sign-out, user updates, and token management.
 */
export function AuthProvider({ children, user, onSignIn, onSignOut, onUpdateUser }: AuthProviderPropsType) {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null | undefined>(user);
  const { removeSearchParams, getSearchParams, searchParams } = useSearchParams();
  // Get the brand-scoped axios instance for this embed
  const axiosInstance = useAxiosInstance();

  // Access isEmbed from BaseContext
  const { isEmbed, isInIframe, brandDetails } = useBaseContext?.() || { isEmbed: false };

  // Access embed context if available
  const embedContext = useSafeEmbedContext?.();
  const embedData = embedContext?.embedData;

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

  const [authenticationStatus, setAuthenticationStatus] = useState<AuthenticationStatusType>(
    user ? "authenticated" : "unauthenticated"
  );

  useLayoutEffect(() => {
    /*
      AnalyticsProvider is the parent, and AuthProvider is its child.
      In the web app, the analytics payload is initialized with null values.
      Once authentication is resolved—or on page refresh when the user is already logged in—
      we update the analytics payload with authenticated user details from NextAuth.
      This update is skipped in embed mode.
    */
    if (!isEmbed && authenticatedUser) {
      AnalyticsService.updatePayload({
        gen_user_id: authenticatedUser.id,
        user_id: authenticatedUser.id,
        phone_no: authenticatedUser.phoneNumber,
        user_name: authenticatedUser.nickname,
        gen_user_name: authenticatedUser.nickname,
      });
    }
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
          axiosRegistry.clearAuthTokenFromAll();
        } else {
          // In non-embed mode, perform full sign-out with redirect
          await signOut("/home");
        }
      } catch (error) {
        console.error("AuthProvider: Error handling logout event:", error);
      }
    };

    SDKEventEmitter.on(SDKListenerEventName.AUTHENTICATE_USER, handleAuthenticateUser);

    SDKEventEmitter.on(SDKListenerEventName.LOGOUT_USER, handleLogoutUser);

    return () => {
      SDKEventEmitter.off(SDKListenerEventName.AUTHENTICATE_USER, handleAuthenticateUser);
      SDKEventEmitter.off(SDKListenerEventName.LOGOUT_USER, handleLogoutUser);
    };
  }, [isEmbed]);

  // Synchronously manage the authentication token in Axios instance when the external 'user' prop changes.
  // This ensures the token is set/removed before any subsequent network requests.
  useLayoutEffect(() => {
    // Use authenticatedUser first as it reflects the most current state (including refreshed tokens)
    // If authenticatedUser is explicitly null (after logout), don't fall back to user prop

    // hasTokenChanged tracks the token & ensures we only invalidate queries if the token actually changes, preventing unnecessary refetches
    const token = authenticatedUser === null ? null : (authenticatedUser?.accessToken ?? user?.accessToken ?? null);

    let hasTokenChanged = false;
    if (token) {
      hasTokenChanged = axiosRegistry.setAuthTokenOnAll(token);
    } else {
      hasTokenChanged = axiosRegistry.clearAuthTokenFromAll();
    }

    // Invalidate ALL queries when auth token changes
    // Authentication data is included in every API request, so all responses
    // (including feed, user data, etc.) are personalized based on the user's auth state
    if (hasTokenChanged) {
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
        if (newUser) {
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
        axiosRegistry.clearAuthTokenFromAll(); // Ensure token is removed on sign out.
      } catch (error) {
        setAuthenticationStatus("unauthenticated");
        console.error("Error during sign out:", error);
      }
    },
    [onSignOut]
  );

  // this is used for updating the user state in the embed when the video is watched and the user is authenticated. We need to update the user state in the embed because the video watched status is stored in the user object and we want to reflect that change in the embed without requiring a page refresh.
  const updateUser = useCallback(
    async (newUser: Partial<AuthUser>) => {
      try {
        setAuthenticationStatus("loading");
        if (newUser) {
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
        setAuthenticationStatus(authenticatedUser ? "authenticated" : "unauthenticated");
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
      pendingActionData?: Omit<PendingActionData, "timestamp" | "divId">;
    }) => {
      // Non-embed (real webapp) or already authenticated: return undefined so the
      // consumer shows the SDK auth modal exactly as before.
      if (!isEmbed || authenticationStatus === "authenticated") {
        return undefined;
      }

      const isStandardWall = embedData?.style === "standard_wall";

      // STANDARD_WALL ONLY: never show the SDK auth modal. Always return a redirect
      // handler — host callback if configured, else per-embed signInUrl, else whitelabel.
      if (isStandardWall) {
        return () => {
          if (authenticationStatus === "unauthenticated" && pendingActionData) {
            const enrichedPendingActionData: Omit<PendingActionData, "timestamp"> = {
              ...pendingActionData,
              divId: embedContext?.rootElement?.id,
            };
            savePendingAction(enrichedPendingActionData);
          }

          triggerStandardWallRedirect({ authCallbackData, embedData, brandDetails, urlToOpen });
        };
      }

      // OTHER embed layouts (carousel / feed / grid / expand_only): UNCHANGED.
      // They already redirect via genuinAuth or their hideModal <Link>.
      if (window.genuinAuth || embedData?.authInfo?.signInUrl || embedData?.authInfo?.signUpUrl) {
        return () => {
          // Save pending action if provided and user is unauthenticated
          if (authenticationStatus === "unauthenticated" && pendingActionData) {
            // Automatically add divId and embedId from the current embed context
            const enrichedPendingActionData: Omit<PendingActionData, "timestamp"> = {
              ...pendingActionData,
              divId: embedContext?.rootElement?.id,
            };
            savePendingAction(enrichedPendingActionData);
          }

          if (window.genuinAuth) {
            window.genuinAuth(authCallbackData);
          }
        };
      }

      // so consumer shows auth modal
      return undefined;
    },
    [
      isEmbed,
      authenticationStatus,
      embedData?.style,
      embedData?.authInfo,
      embedContext?.rootElement?.id,
      brandDetails?.white_label_url,
    ]
  );

  useEffect(() => {
    // Response interceptor to handle token refresh
    // Uses the brand-scoped axios instance for multi-embed support
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // If the error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newTokens = await performTokenRefresh(user?.accessToken, user?.refreshToken);

            if (newTokens) {
              const updatedUser = { ...user, ...newTokens };

              if (isEmbed) emitCachedUserUpdateEvent(updatedUser);

              await updateUser(updatedUser);
              // Set auth token on all brand instances (shared auth)
              axiosRegistry.setAuthTokenOnAll(newTokens.accessToken);
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            if (isEmbed) {
              axiosRegistry.clearAuthTokenFromAll();
              emitRefreshFailedEvent({
                token: authenticatedUser?.autoLoginToken || user?.autoLoginToken,
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
  }, [axiosInstance]);

  return (
    <AuthContext.Provider
      value={{
        user: authenticatedUser,
        authenticationStatus,
        signIn,
        signOut,
        updateUser,
        updateLocalStorageUserData,
        handleAuthCallback,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
