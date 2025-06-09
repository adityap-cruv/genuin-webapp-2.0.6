import { createContext, useContext } from "react";
import type { AuthUser } from "@types/auth";

type AuthContextType = {
  user?: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (
    user: AuthUser,
    callback: (status: "success" | "error", user: AuthUser) => void
  ) => void;
  signOut: () => void;
  updateUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
  updateUser: () => {},
});

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
