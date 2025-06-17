"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to get the current window pathname.
 * @returns {string} The current pathname of the window.
 */
export const useWindowPathname = (): string => {
  const [pathname, setPathname] = useState<string>(
    window !== undefined ? window.location.pathname : "/"
  );

  useEffect(() => {
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
