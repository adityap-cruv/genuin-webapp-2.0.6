"use client";

import { useState, useLayoutEffect } from "react";

/**
 * Custom hook to get the current window pathname.
 * @returns {string} The current pathname of the window.
 */
export const useWindowPathname = (): string => {
  const [pathname, setPathname] = useState<string>("/");

  useLayoutEffect(() => {
    setPathname(window.location.pathname);
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
