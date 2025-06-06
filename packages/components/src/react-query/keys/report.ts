import { baseQueryKey } from "./base";

/**
 * Query key factory for report-related queries
 * 
 * @description
 * Generates a unique query key array for TanStack Query to manage report-related data.
 * This key is used to cache and manage queries related to content reporting functionality.
 * 
 * @param contentId - The unique identifier of the content being reported
 * @param reportFor - The type of content being reported (e.g., "post", "comment")
 * 
 * @returns An array representing the unique query key for report data
 */
export function getQueryKeyForReport(contentId: string, reportFor: string) {
  return [...baseQueryKey, "report", reportFor, contentId];
}
