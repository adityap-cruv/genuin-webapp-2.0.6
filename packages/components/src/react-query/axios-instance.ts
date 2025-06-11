import axios from "axios";

let authTokenInterceptorId: number | null = null;

/**
 * This is the axios instance that will be used for all requests.
 */
export const axiosInstance = axios.create({
  baseURL: "https://api.qa.begenuin.com",
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
        console.log("Setting auth token in Axios instance:", token);
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
  axiosInstance.interceptors.request.use((config) => {
    if (brandId) config.headers["x-brand-id"] = brandId;
    return config;
  });
}

export function removeAllAuthToken() {
  axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = undefined;
    return config;
  });
}
