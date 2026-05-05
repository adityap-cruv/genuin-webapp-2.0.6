"use client";
import type { AxiosInstance } from "axios";
import axios from "axios";
import { createContext, useContext } from "react";

import { NEXT_PUBLIC_API_URL } from "@genuin/components/lib/utils/env";

export type AxiosContextType = {
  axiosInstance: AxiosInstance;
  brandId: number;
};

export const axiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

/**
 * Context for providing brand-scoped axios instances.
 * Each embed gets its own context with the correct axios instance for its brand.
 */
export const AxiosContext = createContext<AxiosContextType | null>(null);

/**
 * Hook to get the brand-scoped axios instance.
 * Falls back to global instance for backward compatibility (webapp/legacy).
 */
export function useAxiosInstance(): AxiosInstance {
  const context = useContext(AxiosContext);
  // Fallback to global instance if not in context (webapp/legacy)
  return context?.axiosInstance ?? axiosInstance;
}

/**
 * Hook to get the full axios context including brandId.
 * Returns null if not inside an AxiosProvider.
 */
export function useAxiosContext(): AxiosContextType | null {
  return useContext(AxiosContext);
}
