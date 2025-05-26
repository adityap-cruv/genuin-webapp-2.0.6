import axios from "axios";

// TODO: Figure out a way for implementing env variables in the package.
// TODO: also create user builder for api calls.
/**
 * This is the axios instance that will be used for all requests.
 */
export const axiosInstance = axios.create({
  baseURL: "https://api.qa.begenuin.com",
});

/**
 * This request will send Authorization headers in future request.
 * @param token
 */
export function setAuthTokenInAxiosInstance(token?: string) {
  return axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = "Bearer " + token;
    return config;
  });
}

export function ejectAuthTokenInterceptor(id: number) {
  axiosInstance.interceptors.request.eject(id);
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
