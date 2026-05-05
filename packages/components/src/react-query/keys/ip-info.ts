import type { QueryKey } from "@tanstack/react-query";

import { baseQueryKey } from "./base";

/**
 * Generates a query key array for IP information using React Query.
 *
 * This key is used with `useQuery` to uniquely identify and cache
 * the IP geolocation data fetched from the backend. It builds upon
 * the base query key.
 *
 * @returns {Array<string>} The query key array for IP info
 */
export function getQueryKeyForIpInfo(): QueryKey {
  return [...baseQueryKey];
}
