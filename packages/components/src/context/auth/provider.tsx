"use client";
import {
  removeAllAuthToken,
  setAuthTokenInAxiosInstance,
} from "@react-query/axios-instance";
import type { AuthUser } from "@types/auth";

import { AuthContext } from "./context";

type AuthProviderPropsType = {
  children: React.ReactNode;
  user: AuthUser | null;
};

/**
 * This is the provider for the auth context.
 * It provides the user object and the isAuthenticated boolean to the rest of the app.
 * @param param0
 * @returns
 */
export function AuthProvider({ children, user }: AuthProviderPropsType) {
  if (user) setAuthTokenInAxiosInstance(user.accessToken);
  if (!user) {
    removeAllAuthToken();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn(user, callback) {
          alert("user try to sign in");
          // setAuthTokenInAxiosInstance(user.accessToken);
          callback("success", user);
        },
        signOut() {
          alert("user try to sign out");
          // removeAllAuthToken();
        },
        updateUser(user) {
          alert("user try to update user");
          // setAuthTokenInAxiosInstance(user.accessToken);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
