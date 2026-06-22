"use client";
import { createContext, useContext, useRef, type ReactNode } from "react";

import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

const EventBusContext = createContext<CxrEventBus | undefined>(undefined);

interface EventBusProviderProps {
  children: ReactNode;
}

/**
 * Provide a per-instance {@link CxrEventBus} to the React tree.
 *
 * The bus is created once via a ref and never replaced — it is stable across
 * renders. Mount once at the App root, inside (or alongside) `InstanceProvider`.
 */
export function EventBusProvider({ children }: EventBusProviderProps): ReactNode {
  const busRef = useRef<CxrEventBus | null>(null);
  if (busRef.current === null) {
    busRef.current = new CxrEventBus();
  }
  return <EventBusContext.Provider value={busRef.current}>{children}</EventBusContext.Provider>;
}

/**
 * Returns the {@link CxrEventBus} for the nearest enclosing {@link EventBusProvider}.
 *
 * @throws Error when called outside a provider (programming error).
 */
export function useEventBus(): CxrEventBus {
  const ctx = useContext(EventBusContext);
  if (!ctx) {
    throw new Error("useEventBus must be used inside <EventBusProvider>");
  }
  return ctx;
}
