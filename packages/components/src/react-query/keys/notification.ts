import { QueryKey } from "@tanstack/react-query";

/**
 * This function generates a unique query key for the notification count.
 * @returns
 */
export function getQueryKeyForNotificationCount(): QueryKey {
  return ["notification", "count"];
}

/**
 * This function generates a unique query key for the fetch notifications.
 * @returns
 */
export function getQueryKeyForNotifications(): QueryKey {
  return ["notification", "paginated"];
}
