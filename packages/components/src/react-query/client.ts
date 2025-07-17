import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

/**
 * Invalidate all queries in the query client.
 * This is useful to refresh data across the application.
 */
export function invalidateAllQueries() {
  queryClient.invalidateQueries();
}
