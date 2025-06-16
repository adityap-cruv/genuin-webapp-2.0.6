"use client";

import { useState, useEffect, useCallback } from "react";

type UseSearchParamsReturn = {
  searchParams: string;
  addSearchParams: (params: Record<string, string | string[]>) => void;
  removeSearchParams: (keys: string | string[]) => void;
  getSearchParams: (key: string) => string | string[] | null;
};

/**
 * Custom hook for managing URL search parameters
 * Provides functionality to add, remove, and get current search parameters
 *
 * @returns An object containing:
 * - searchParams: Current search parameters as a string
 * - addSearchParams: Function to add new search parameters
 * - removeSearchParams: Function to remove search parameters by key(s)
 * - getSearchParams: Function to get search parameter value(s) by key
 */
export function useSearchParams(): UseSearchParamsReturn {
  const [searchParams, setSearchParams] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.search;
    }
    return "";
  });

  // Update search params string when URL changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSearchParams = () => {
      setSearchParams(window.location.search);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", updateSearchParams);

    return () => {
      window.removeEventListener("popstate", updateSearchParams);
    };
  }, []);

  /**
   * Add new search parameters to the current URL
   * @param params - Object with key-value pairs to add. Values can be string or string[]
   */
  const addSearchParams = useCallback(
    (params: Record<string, string | string[]>) => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const urlSearchParams = url.searchParams;

      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Remove existing values for this key first
          urlSearchParams.delete(key);
          // Add all values in the array
          value.forEach((val) => urlSearchParams.append(key, val));
        } else {
          urlSearchParams.set(key, value);
        }
      });

      const newUrl = `${url.pathname}${urlSearchParams.toString() ? "?" + urlSearchParams.toString() : ""}${url.hash}`;

      // Update URL without page reload
      window.history.pushState(null, "", newUrl);

      // Update local state
      setSearchParams(
        urlSearchParams.toString() ? "?" + urlSearchParams.toString() : ""
      );
    },
    []
  );

  /**
   * Remove search parameters from the current URL
   * @param keys - Single key or array of keys to remove
   */
  const removeSearchParams = useCallback((keys: string | string[]) => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const urlSearchParams = url.searchParams;

    const keysToRemove = Array.isArray(keys) ? keys : [keys];

    keysToRemove.forEach((key) => {
      urlSearchParams.delete(key);
    });

    const newUrl = `${url.pathname}${urlSearchParams.toString() ? "?" + urlSearchParams.toString() : ""}${url.hash}`;

    // Update URL without page reload
    window.history.pushState(null, "", newUrl);

    // Update local state
    setSearchParams(
      urlSearchParams.toString() ? "?" + urlSearchParams.toString() : ""
    );
  }, []);

  /**
   * Get search parameter value(s) by key
   * @param key - The search parameter key to get
   * @returns The value(s) for the key, or null if not found
   * - Returns string if only one value exists
   * - Returns string[] if multiple values exist
   * - Returns null if key doesn't exist
   */
  const getSearchParams = useCallback(
    (key: string): string | string[] | null => {
      if (typeof window === "undefined") return null;

      const urlSearchParams = new URLSearchParams(window.location.search);
      const values = urlSearchParams.getAll(key);

      if (values.length === 0) {
        return null;
      } else if (values.length === 1) {
        return values[0] || null;
      } else {
        return values;
      }
    },
    []
  );

  return {
    searchParams,
    addSearchParams,
    removeSearchParams,
    getSearchParams,
  };
}
