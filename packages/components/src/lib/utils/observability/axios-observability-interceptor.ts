// lib/axios-observability-interceptor.ts
import type { AxiosInstance } from "axios";

import type * as ObservabilityService from "@genuin/components/lib/utils/observability/service";

let interceptorId: number | null = null;
let observabilityUtils: typeof ObservabilityService | null = null;

/**
 * Lazy load observability utilities for axios interceptor
 */
async function loadObservabilityUtils() {
  if (!observabilityUtils) {
    observabilityUtils = await import("@genuin/components/lib/utils/observability/service");
  }
  return observabilityUtils;
}

/**
 * Setup axios response interceptor for performance tracking
 * This interceptor captures API status codes and error messages
 * @param axiosInstance - The axios instance to attach the interceptor to
 */
export async function setupObservabilityInterceptor(axiosInstance: AxiosInstance) {
  // Load utilities first
  const utils = await loadObservabilityUtils();

  // Remove existing interceptor if any
  if (interceptorId !== null) {
    axiosInstance.interceptors.response.eject(interceptorId);
  }

  // Add response interceptor to capture status codes for performance tracking
  interceptorId = axiosInstance.interceptors.response.use(
    (response) => {
      const url = response.config.url || "";
      utils.observabilityTracker.setApiStatusCode(url, response.status);
      return response;
    },
    (error) => {
      const url = error.config?.url || "";

      if (error.response) {
        // Server responded with error status
        utils.observabilityTracker.setApiStatusCode(url, error.response.status);
        utils.observabilityTracker.setApiErrorMessage(
          url,
          error.response.data?.message || error.message || "Request failed"
        );
      } else if (error.request) {
        // Request made but no response (network error, timeout, etc.)
        utils.observabilityTracker.setApiErrorMessage(url, error.message || "Network error");
      } else {
        utils.observabilityTracker.setApiErrorMessage(url, error.message || "Unknown error");
      }

      return Promise.reject(error);
    }
  );

  return interceptorId;
}

/**
 * Remove the observability interceptor
 * @param axiosInstance - The axios instance to remove the interceptor from
 */
export function removeObservabilityInterceptor(axiosInstance: AxiosInstance) {
  if (interceptorId !== null) {
    axiosInstance.interceptors.response.eject(interceptorId);
    interceptorId = null;
  }
}
