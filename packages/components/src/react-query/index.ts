/**
 * Centralized exports for react-query hooks with axios injection.
 *
 * This file provides convenient access to our custom hooks with automatic axios instance injection.
 */

// Export other react-query utilities
export { queryClient, invalidateAllQueries } from "./client";

// Re-export TanStack Query v5 types consumed across this package
export type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
