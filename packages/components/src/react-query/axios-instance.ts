import axios from "axios";
import { NEXT_PUBLIC_API_URL } from "../lib/utils/env";

let authTokenInterceptorId: number | null = null;
let brandIdInterceptorId: number | null = null;

/**
 * This is the axios instance that will be used for all requests.
 */
export const axiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

/**
 * Sets the Authorization header for all future requests.
 * Ejects any previous interceptor to avoid stacking.
 * @param token
 */
export function setAuthTokenInAxiosInstance(token?: string) {
  // Eject previous interceptor if it exists
  if (authTokenInterceptorId !== null) {
    axiosInstance.interceptors.request.eject(authTokenInterceptorId);
    authTokenInterceptorId = null;
  }
  if (token) {
    authTokenInterceptorId = axiosInstance.interceptors.request.use(
      (config) => {
        config.headers.Authorization = "Bearer " + token;
        return config;
      }
    );
  }
}

/**
 * Clears the Authorization header interceptor.
 */
export function clearAuthTokenInterceptor() {
  if (authTokenInterceptorId !== null) {
    axiosInstance.interceptors.request.eject(authTokenInterceptorId);
    authTokenInterceptorId = null;
  }
}

export function setBrandIdInAxiosInstance(brandId?: number) {
  // Eject previous interceptor if it exists
  if (brandIdInterceptorId !== null) {
    axiosInstance.interceptors.request.eject(brandIdInterceptorId);
    brandIdInterceptorId = null;
  }
  if (brandId) {
    brandIdInterceptorId = axiosInstance.interceptors.request.use((config) => {
      config.headers["x-brand-id"] = brandId;
      return config;
    });
  }
}

/**
 * Removes all authentication tokens by clearing the auth interceptor.
 * This properly removes the interceptor instead of adding a new one that overrides headers.
 */
export function removeAllAuthToken() {
  clearAuthTokenInterceptor();
}
