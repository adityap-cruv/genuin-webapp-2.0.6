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

    let lastSearchParams = window.location.search;

    const updateSearchParams = () => {
      // Only update if the search params have actually changed
      if (window.location.search !== lastSearchParams) {
        lastSearchParams = window.location.search;
        setSearchParams(window.location.search);
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", updateSearchParams);

    // Handle URL changes made by browser extensions or direct URL manipulation
    window.addEventListener("hashchange", updateSearchParams);

    // Listen for programmatic URL changes via a custom event dispatched by the shared proxy.
    // Using a custom event (rather than calling setSearchParams directly inside the patched
    // pushState/replaceState) ensures that the React state update is never triggered
    // synchronously inside a pushState call, which would cause React 19 to throw
    // "useInsertionEffect must not schedule updates" when pushState is called during
    // a useInsertionEffect phase.
    window.addEventListener("genuin:urlchange", updateSearchParams);

    // Install the shared history proxy only once per page load.
    // Multiple hook instances each listen via the custom event above so we do not
    // stack proxy layers (which previously corrupted cleanup order).
    if (!(window.history.pushState as { __genuinPatched?: boolean }).__genuinPatched) {
      const originalPushState = window.history.pushState;
      const patchedPushState = function (this: History, ...args: Parameters<typeof History.prototype.pushState>) {
        const result = originalPushState.apply(this, args);
        // Use queueMicrotask so that setSearchParams is never called synchronously
        // inside a pushState invocation. This prevents React 19 from throwing
        // "useInsertionEffect must not schedule updates" when pushState happens to
        // be called while React is running a useInsertionEffect phase.
        queueMicrotask(() => window.dispatchEvent(new Event("genuin:urlchange")));
        return result;
      };
      (patchedPushState as { __genuinPatched?: boolean }).__genuinPatched = true;
      window.history.pushState = patchedPushState;

      const originalReplaceState = window.history.replaceState;
      const patchedReplaceState = function (this: History, ...args: Parameters<typeof History.prototype.replaceState>) {
        const result = originalReplaceState.apply(this, args);
        queueMicrotask(() => window.dispatchEvent(new Event("genuin:urlchange")));
        return result;
      };
      (patchedReplaceState as { __genuinPatched?: boolean }).__genuinPatched = true;
      window.history.replaceState = patchedReplaceState;
    }

    return () => {
      // Clean up only the event listeners owned by this hook instance.
      // The shared history proxy is intentionally left in place so that other
      // mounted instances (and future mounts) keep receiving URL change events.
      window.removeEventListener("popstate", updateSearchParams);
      window.removeEventListener("hashchange", updateSearchParams);
      window.removeEventListener("genuin:urlchange", updateSearchParams);
    };
  }, []);

  /**
   * Add new search parameters to the current URL
   * @param params - Object with key-value pairs to add. Values can be string or string[]
   */
  const addSearchParams = useCallback((params: Record<string, string | string[]>) => {
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
    // Our proxied pushState method will handle updating the searchParams state
    window.history.pushState(null, "", newUrl);
  }, []);

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
    // Our proxied pushState method will handle updating the searchParams state
    window.history.pushState(null, "", newUrl);
  }, []);

  /**
   * Get search parameter value(s) by key
   * @param key - The search parameter key to get
   * @returns The value(s) for the key, or null if not found
   * - Returns string if only one value exists
   * - Returns string[] if multiple values exist
   * - Returns null if key doesn't exist
   */
  const getSearchParams = useCallback((key: string): string | string[] | null => {
    if (typeof window === "undefined") return null;

    // Always use the current window.location.search to ensure we have the latest values
    const urlSearchParams = new URLSearchParams(window.location.search);

    // Check if the key exists before getting all values
    if (!urlSearchParams.has(key)) {
      return null;
    }

    const values = urlSearchParams.getAll(key);

    // Return appropriate value based on count
    if (values.length === 0) {
      return null;
    } else if (values.length === 1) {
      return values[0] || null;
    } else {
      return values;
    }
  }, []);

  return {
    searchParams: typeof window !== "undefined" ? window.location.search : searchParams,
    addSearchParams,
    removeSearchParams,
    getSearchParams,
  };
}
