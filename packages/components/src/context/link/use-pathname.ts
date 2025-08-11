import { embedRouter } from "@genuin/components/lib/utils/embed-router";

/**
 * Custom hook that mimics Next.js usePathname() using wouter's memory location.
 * This hook provides the current pathname from the embedRouter's memory location.
 *
 * @returns {string} The current pathname
 */
export function usePathnameFromEmbedRouter(): string {
  // Use the embedRouter's hook directly to get the current location
  const [location] = embedRouter.hook();

  return location;
}
