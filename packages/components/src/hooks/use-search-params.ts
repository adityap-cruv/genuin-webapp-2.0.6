"use client";

import { useCallback, useMemo, useState, useEffect } from "react";

/**
 * Custom hook for managing URL search parameters
 * Provides utilities for reading, setting, and manipulating search params
 * Works directly with browser APIs without Next.js dependencies
 */
export function useSearchParams() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  // Update search params when URL changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSearchParams = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", updateSearchParams);

    // Listen for pushstate/replacestate events
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      updateSearchParams();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      updateSearchParams();
    };

    return () => {
      window.removeEventListener("popstate", updateSearchParams);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Get a specific search parameter
  const get = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  // Get all search parameters as an object
  const getAll = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Get all values for a specific key (for parameters that can have multiple values)
  const getAllValues = useCallback(
    (key: string): string[] => {
      return searchParams.getAll(key);
    },
    [searchParams]
  );

  // Check if a parameter exists
  const has = useCallback(
    (key: string): boolean => {
      return searchParams.has(key);
    },
    [searchParams]
  );

  // Get the raw URLSearchParams object
  const raw = useMemo(() => searchParams, [searchParams]);

  // Get search params as a string
  const toString = useCallback((): string => {
    return searchParams.toString();
  }, [searchParams]);

  // Get the size (number of parameters)
  const size = useMemo(() => {
    let count = 0;
    searchParams.forEach(() => count++);
    return count;
  }, [searchParams]);

  return {
    /**
     * Get the value of a specific search parameter
     * @param key - The parameter key
     * @returns The parameter value or null if not found
     */
    get,

    /**
     * Get all search parameters as a key-value object
     * @returns Object containing all search parameters
     */
    getAll,

    /**
     * Get all values for a parameter that can have multiple values
     * @param key - The parameter key
     * @returns Array of all values for the key
     */
    getAllValues,

    /**
     * Check if a specific search parameter exists
     * @param key - The parameter key
     * @returns Boolean indicating if the parameter exists
     */
    has,

    /**
     * Get the raw URLSearchParams object
     * @returns The native URLSearchParams instance
     */
    raw,

    /**
     * Convert search parameters to string format
     * @returns String representation of search parameters
     */
    toString,

    /**
     * Get the number of search parameters
     * @returns Number of parameters
     */
    size,
  };
}

/**
 * Hook for managing search parameters with state updates
 * Provides methods to create new search param strings for navigation
 */
export function useSearchParamsState() {
  const { raw: searchParams } = useSearchParams();

  // Create a new URLSearchParams instance for mutations
  const createUpdatedParams = useCallback(
    (updates: Record<string, string | null>): URLSearchParams => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params;
    },
    [searchParams]
  );

  // Create a search string with updated parameters
  const createSearchString = useCallback(
    (updates: Record<string, string | null>): string => {
      const params = createUpdatedParams(updates);
      const searchString = params.toString();
      return searchString ? `?${searchString}` : "";
    },
    [createUpdatedParams]
  );

  // Set multiple parameters at once
  const setParams = useCallback(
    (updates: Record<string, string | null>): string => {
      return createSearchString(updates);
    },
    [createSearchString]
  );

  // Set a single parameter
  const setParam = useCallback(
    (key: string, value: string | null): string => {
      return createSearchString({ [key]: value });
    },
    [createSearchString]
  );

  // Remove a parameter
  const removeParam = useCallback(
    (key: string): string => {
      return createSearchString({ [key]: null });
    },
    [createSearchString]
  );

  // Remove multiple parameters
  const removeParams = useCallback(
    (keys: string[]): string => {
      const updates = keys.reduce(
        (acc, key) => {
          acc[key] = null;
          return acc;
        },
        {} as Record<string, null>
      );
      return createSearchString(updates);
    },
    [createSearchString]
  );

  // Clear all parameters
  const clearAll = useCallback((): string => {
    return "";
  }, []);

  return {
    /**
     * Set multiple search parameters
     * @param updates - Object with key-value pairs to update (null values will remove the parameter)
     * @returns Search string to use with router.push()
     */
    setParams,

    /**
     * Set a single search parameter
     * @param key - Parameter key
     * @param value - Parameter value (null to remove)
     * @returns Search string to use with router.push()
     */
    setParam,

    /**
     * Remove a single search parameter
     * @param key - Parameter key to remove
     * @returns Search string to use with router.push()
     */
    removeParam,

    /**
     * Remove multiple search parameters
     * @param keys - Array of parameter keys to remove
     * @returns Search string to use with router.push()
     */
    removeParams,

    /**
     * Clear all search parameters
     * @returns Empty search string
     */
    clearAll,

    /**
     * Create a search string with updated parameters
     * @param updates - Object with key-value pairs to update
     * @returns Search string to use with router.push()
     */
    createSearchString,
  };
}

/**
 * Utility type for search parameter values
 */
export type SearchParamValue = string | string[] | undefined;

/**
 * Type-safe hook for working with specific search parameters
 * @param key - The search parameter key
 * @returns Object with value and helpers for the specific parameter
 */
export function useSearchParam(key: string) {
  const { get, has, getAllValues } = useSearchParams();
  const { setParam, removeParam } = useSearchParamsState();

  const value = get(key);
  const values = getAllValues(key);
  const exists = has(key);

  return {
    /**
     * Current value of the search parameter
     */
    value,

    /**
     * All values if the parameter has multiple values
     */
    values,

    /**
     * Whether the parameter exists in the URL
     */
    exists,

    /**
     * Set the parameter value
     * @param newValue - New value for the parameter
     * @returns Search string to use with router.push()
     */
    set: (newValue: string) => setParam(key, newValue),

    /**
     * Remove the parameter
     * @returns Search string to use with router.push()
     */
    remove: () => removeParam(key),
  };
}
