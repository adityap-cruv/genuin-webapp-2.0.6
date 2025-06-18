"use client";

import { useState, useLayoutEffect } from "react";
import { useLinkContext } from "../context/link";

export function usePathname() {
  const { usePathname: customPathname } = useLinkContext();
  return customPathname ? customPathname() : useWindowPathname();
}

/**
 * Custom hook to get the current window pathname.
 * @returns {string} The current pathname of the window.
 */
const useWindowPathname = (): string => {
  // Initialize with actual pathname if available (browser environment)
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  });

  useLayoutEffect(() => {
    // Ensure we have the current pathname on mount
    const currentPathname = window.location.pathname;
    if (currentPathname !== pathname) {
      setPathname(currentPathname);
    }

    const handlePathnameChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handlePathnameChange);

    return () => {
      window.removeEventListener("popstate", handlePathnameChange);
    };
  }, []);

  return pathname;
};
