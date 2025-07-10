import { QueryKey } from "@tanstack/react-query";

/**
 * This function generates a unique query key for the notification count.
 * @returns
 */
export function getQueryKeyForNotificationCount(): QueryKey {
  return ["notification", "count"];
}
