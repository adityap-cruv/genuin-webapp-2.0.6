import { useCallback, useMemo } from 'react'
import { useLocation } from 'wouter'
import { navigate } from '../router/context'

export type UseSearchParamsReturn = {
  /** Get a search parameter value by key */
  get: (key: string) => string | null
  /** Get all search parameters as an object */
  getAll: () => Record<string, string>
  /** Set a search parameter */
  set: (key: string, value: string) => void
  /** Set multiple search parameters at once */
  setMultiple: (params: Record<string, string>) => void
  /** Delete a search parameter */
  delete: (key: string) => void
  /** Delete multiple search parameters */
  deleteMultiple: (keys: string[]) => void
  /** Check if a search parameter exists */
  has: (key: string) => boolean
  /** Clear all search parameters */
  clear: () => void
  /** Get the raw URLSearchParams object */
  searchParams: URLSearchParams
  /** Get the search string (e.g., "?key=value&other=test") */
  searchString: string
}

/**
 * Hook for managing URL search parameters
 *
 * @example
 * ```tsx
 * const { get, set, delete: deleteParam, has } = useSearchParams();
 *
 * // Get a parameter
 * const userId = get('userId');
 *
 * // Set a parameter
 * set('filter', 'active');
 *
 * // Check if parameter exists
 * if (has('debug')) {
 *   console.log('Debug mode enabled');
 * }
 *
 * // Delete a parameter
 * deleteParam('temp');
 * ```
 */
export const useSearchParams = (): UseSearchParamsReturn => {
  const [location] = useLocation()

  // Get current search params from the URL
  const searchParams = useMemo(() => {
    if (typeof window === 'undefined') {
      return new URLSearchParams()
    }
    return new URLSearchParams(window.location.search)
  }, [location])

  // Get search string
  const searchString = useMemo(() => {
    const params = searchParams.toString()
    return params ? `?${params}` : ''
  }, [searchParams])

  // Update URL with new search parameters
  const updateURL = useCallback((newSearchParams: URLSearchParams) => {
    if (typeof window === 'undefined') return

    const newSearch = newSearchParams.toString()
    const currentPath = window.location.pathname
    const newURL = `${currentPath}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`

    // Use the navigate function from router context
    navigate(newURL)
  }, [])

  // Get a search parameter value
  const get = useCallback(
    (key: string): string | null => {
      return searchParams.get(key)
    },
    [searchParams],
  )

  // Get all search parameters as an object
  const getAll = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  // Set a search parameter
  const set = useCallback(
    (key: string, value: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set(key, value)
      updateURL(newSearchParams)
    },
    [searchParams, updateURL],
  )

  // Set multiple search parameters at once
  const setMultiple = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams)
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, value)
      })
      updateURL(newSearchParams)
    },
    [searchParams, updateURL],
  )

  // Delete a search parameter
  const deleteParam = useCallback(
    (key: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete(key)
      updateURL(newSearchParams)
    },
    [searchParams, updateURL],
  )

  // Delete multiple search parameters
  const deleteMultiple = useCallback(
    (keys: string[]) => {
      const newSearchParams = new URLSearchParams(searchParams)
      keys.forEach((key) => {
        newSearchParams.delete(key)
      })
      updateURL(newSearchParams)
    },
    [searchParams, updateURL],
  )

  // Check if a search parameter exists
  const has = useCallback(
    (key: string): boolean => {
      return searchParams.has(key)
    },
    [searchParams],
  )

  // Clear all search parameters
  const clear = useCallback(() => {
    updateURL(new URLSearchParams())
  }, [updateURL])

  return {
    get,
    getAll,
    set,
    setMultiple,
    delete: deleteParam,
    deleteMultiple,
    has,
    clear,
    searchParams,
    searchString,
  }
}

export default useSearchParams
