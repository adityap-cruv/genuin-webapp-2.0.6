"use client";

import { useAutoLogin } from "@/lib/hooks/use-auto-login";

/**
 * Component that handles auto-login functionality
 * Must be placed inside AuthProvider and BaseContextProvider
 */
export function AutoLoginHandler() {
  useAutoLogin();
  return null;
}
