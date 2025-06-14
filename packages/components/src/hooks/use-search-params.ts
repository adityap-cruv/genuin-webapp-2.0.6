"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for managing URL search parameters
 * Returns the current search parameters as a string
 */
export function useSearchParams(): string {
  const [searchParamsString, setSearchParamsString] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.search;
    }
    return "";
  });

  // Update search params string when URL changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSearchParamsString = () => {
      setSearchParamsString(window.location.search);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", updateSearchParamsString);

    return () => {
      window.removeEventListener("popstate", updateSearchParamsString);
    };
  }, []);

  return searchParamsString;
}
