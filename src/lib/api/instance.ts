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

// axiosInstance.interceptors.request.use(() => {})
