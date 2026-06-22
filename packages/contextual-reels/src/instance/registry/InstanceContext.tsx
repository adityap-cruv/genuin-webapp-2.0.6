"use client";
import { createContext, useContext, type ReactNode } from "react";

const InstanceContext = createContext<string | undefined>(undefined);

interface InstanceProviderProps {
  instanceId: string;
  children: ReactNode;
}

/**
 * Provide an opaque per-widget instance identifier to the React tree.
 *
 * Mount once at the App root. Consumers call `useInstanceId()` to read it.
 */
export function InstanceProvider({ instanceId, children }: InstanceProviderProps): ReactNode {
  return <InstanceContext.Provider value={instanceId}>{children}</InstanceContext.Provider>;
}

/**
 * Returns the instanceId for the nearest enclosing {@link InstanceProvider}.
 *
 * @throws Error when called outside a provider (programming error).
 */
export function useInstanceId(): string {
  const ctx = useContext(InstanceContext);
  if (ctx === undefined) {
    throw new Error("useInstanceId must be used inside <InstanceProvider>");
  }
  return ctx;
}
