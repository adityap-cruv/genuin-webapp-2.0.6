import axios from 'axios'

export const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

/**
 * This request will send x-auth-token headers in future request.
 * @param token
 */
export function setAuthTokenInAxiosInstance(token?: string) {
  axiosInstance.interceptors.request.use((config) => {
    config.headers.set('x-auth-token', token)
    return config
  })
}

// axiosInstance.interceptors.request.use(() => {})
