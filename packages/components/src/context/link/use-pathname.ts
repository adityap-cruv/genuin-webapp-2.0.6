import { useSafeEmbedContext } from "../embed/context";

/**
 * Custom hook that mimics Next.js usePathname() using wouter's memory location.
 * This hook provides the current pathname from the embedRouter's memory location.
 *
 * @returns {string} The current pathname
 */
export function usePathnameFromEmbedRouter(): string {
  const embedContext = useSafeEmbedContext();
  // Use the embedRouter's hook directly to get the current location
  const hookResult = embedContext ? embedContext.embedRouter.hook() : ["/"];
  const [location] = hookResult;

  return location;
}
