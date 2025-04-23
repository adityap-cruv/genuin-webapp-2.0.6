import { findLastNonSettingsIndex } from '@/utils'
import { createContext } from 'react'
import { Router } from 'wouter'
import { memoryLocation } from 'wouter/memory-location'
import { ROUTES } from '.'

type RouterContextType = {
  /**
   * If true, it means that the app is running in the web SDK.
   */
  isWebSdk: boolean
}

const RouterContext = createContext<RouterContextType>({
  isWebSdk: false,
})

type RouterProviderPropsType = { children: React.ReactNode }

// This will get memory location for routing.
// Here default pathe is set to /home.
const memoryRouter = memoryLocation({
  record: true,
  path: '/home',
})

export function RouterProvider({ children }: RouterProviderPropsType) {
  return (
    <RouterContext.Provider value={{ isWebSdk: false }}>
      <Router hook={memoryRouter.hook}>{children}</Router>
    </RouterContext.Provider>
  )
}

/**
 * Only pass path of the url to navigate internally. It will navigate to the given URL.
 * @param url
 * @returns
 */
export function navigate(url: string) {
  let route: string = ''
  try {
    route = new URL(url).pathname
  } catch (e) {
    route = url
  }
  console.log('route::', route)
  // This will navigate to the given URL.
  return memoryRouter.navigate(route)
}

/**
 * Navigates back to the last path that doesn't contain "/settings"
 * If no such path is found, it will navigate to the fallback path.
 */
export function goBackToNonSettingsPath(fallbackPath?: string) {
  const lastNonSettingsIndex = findLastNonSettingsIndex(memoryRouter.history)
  if (lastNonSettingsIndex !== -1) {
    navigate(memoryRouter.history[lastNonSettingsIndex])
  } else if (fallbackPath) {
    navigate(fallbackPath)
  }
}

export function goBack() {
  navigate(memoryRouter.history[memoryRouter.history.length - 1])
}

/**
 * Navigates to the not-found page, similar to Next.js notFound() function
 */
export function notFound() {
  navigate(ROUTES.NOT_FOUND)
}
