"use client";
import { useEffect, useState } from "react";

/**
 * Custom hook to track document visibility state
 * @returns boolean - true if document is visible, false if hidden
 */
export function useDocumentVisibilityState(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(typeof document !== "undefined" ? !document.hidden : true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
