"use client";
import { useState, useEffect } from "react";

/**
 * Simple hook that returns the current URL search parameters as a string
 * Works directly with browser APIs without Next.js dependencies
 */
export function useSearchParams(): string {
  const [searchParamsString, setSearchParamsString] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.search;
    }
    return "";
  });

  // Update search params when URL changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSearchParams = () => {
      setSearchParamsString(window.location.search);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", updateSearchParams);

    return () => {
      window.removeEventListener("popstate", updateSearchParams);
    };
  }, []);

  return searchParamsString;
}
