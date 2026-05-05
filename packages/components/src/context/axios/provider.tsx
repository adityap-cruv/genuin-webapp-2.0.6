"use client";
import { useEffect, useMemo } from "react";

import { axiosRegistry } from "./axios-instance-registry";
import { AxiosContext } from "./context";

type AxiosProviderProps = {
  children: React.ReactNode;
  brandId: number;
};

/**
 * IMPORTANT: This provider should be used across the app for any component that needs to make API calls, so that all calls are properly scoped to the brand and auth token is handled correctly.
 * Make sure to use useAxiosInstance hook to access the axios instance from the context in child components.
 */

/**
 * Provider component that supplies a brand-scoped axios instance to its children.
 * Each embed should have its own AxiosProvider with its brand ID.
 *
 * The provider:
 * - Gets or creates an axios instance for the brand from the registry
 * - Provides it via AxiosContext
 * - Releases the instance on unmount
 */
export function AxiosProvider({ children, brandId }: AxiosProviderProps) {
  const axiosInstance = useMemo(() => axiosRegistry.getOrCreateInstance(brandId), [brandId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      axiosRegistry.releaseInstance(brandId);
    };
  }, [brandId]);

  const contextValue = useMemo(() => ({ axiosInstance, brandId }), [axiosInstance, brandId]);

  return <AxiosContext.Provider value={contextValue}>{children}</AxiosContext.Provider>;
}
