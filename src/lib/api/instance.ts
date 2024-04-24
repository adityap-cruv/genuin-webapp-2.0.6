import axios from 'axios'

export const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

/**
 * This request will send x-auth-token headers in future request.
 * @param token
 */
export function setAuthTokenInAxiosInstance(token?: string) {
  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers['x-auth-token'] = token
    return config
  })
}

export function setTempAuthTokenInAxiosInstance(token?: string) {
  axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers['x-temp-auth-token'] = token
    return config
  })
}

export function setBrandIdInAxiosInstance(brandId?: number) {
  axiosInstance.interceptors.request.use((config) => {
    if (brandId) config.headers['x-brand-id'] = brandId
    return config
  })
}

export function removeAllAuthToken() {
  axiosInstance.interceptors.request.use((config) => {
    config.headers['x-auth-token'] = undefined
    config.headers['x-temp-auth-token'] = undefined
    return config
  })
}

// axiosInstance.interceptors.request.use(() => {})
