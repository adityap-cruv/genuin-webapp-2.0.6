import axios, { type AxiosRequestHeaders } from 'axios'

// Create the axios instance with default config
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
})

// Add a request interceptor by default
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

/**
 * This request will send Authorization headers in future request.
 * @param token
 */
export function setAuthTokenInAxiosInstance(token?: string) {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
  }
  return axiosInstance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
}

export function ejectAuthTokenInterceptor(id: number) {
  axiosInstance.interceptors.request.eject(id)
}

export function setBrandIdInAxiosInstance(brandId?: number) {
  if (!brandId) return

  // Set in defaults
  axiosInstance.defaults.headers.common['x-brand-id'] = brandId.toString()

  // Set in instance defaults
  if (!axiosInstance.defaults.headers.common) {
    axiosInstance.defaults.headers.common = {}
  }
}

export function removeAllAuthToken() {
  delete axiosInstance.defaults.headers.common.Authorization
  return axiosInstance.interceptors.request.use((config) => {
    delete config.headers.Authorization
    return config
  })
}